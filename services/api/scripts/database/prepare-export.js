const os = require('os');
const path = require('path');
const process = require('process');
const fs = require('fs/promises');

const { glob } = require('glob');
const mongoose = require('mongoose');
const { program } = require('commander');

const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');

const { User } = require('../../src/models');
const { initialize } = require('../../src/utils/database');

const MONGO_URI = config.get('MONGO_URI');

const DEFAULT_EXCLUDES = [];

program
  .description(
    `
  Prepares database for export. Sanitizes users table and can perform intelligent
  filtering of documents based on refs of type "User".

  Note that multiple user filters will use an $or with the exception of
  before/after dates which work together.
    `
  )
  .option('-a, --created-after [date]', 'Limit to users created after a certain date. Can be any parseable date.')
  .option('-b, --created-before [date]', 'Limit to users created before a certain date. Can be any parseable date.')
  .option('-l, --limit [number]', 'Limit to a fixed number of users from the most recently created.')
  .option('-u, --user-id [string...]', 'Limit to users by ID (can be multiple).')
  .option('-m, --email [string...]', 'Limit to users by email (can be multiple).')
  .option('-e, --exclude [string...]', 'Exclude collections.', DEFAULT_EXCLUDES)
  .option('-r, --raw [boolean]', 'Skip sanitizations. Only use this when necessary.', false)
  .option('-o, --out [string]', 'The directory to export the export to.', 'export');

program.parse(process.argv);
const options = program.opts();

async function run() {
  const connection = await initialize();

  const userIds = await getUserIds();

  const sanitizations = await getSanitizations(options);
  await runSanitizations(connection, sanitizations);

  await exec('rm', ['-rf', options.out]);
  await exportCollections({
    ...options,
    userIds,
    connection,
    sanitizations,
  });
}

async function getUserIds() {
  const filtered = await getFilteredUserIds();
  const limited = await getLimitedUserIds();
  return [...filtered, ...limited];
}

async function getFilteredUserIds() {
  const { createdAfter, createdBefore, userId: userIds, email: emails } = options;

  const $or = [];

  if (createdAfter || createdBefore) {
    const after = parseDate(createdAfter);
    const before = parseDate(createdBefore);

    if (after > before) {
      throw new Error('"--created-after" cannot occur after "--created-before"');
    }

    $or.push({
      createdAt: {
        ...(after && {
          $gte: after,
        }),
        ...(before && {
          $lte: before,
        }),
      },
    });
  }

  if (userIds) {
    for (let id of userIds) {
      if (!mongoose.isObjectIdOrHexString(id)) {
        throw new Error(`Invalid ObjectId ${id}.`);
      }
    }
    $or.push({
      _id: {
        $in: userIds,
      },
    });
  }

  if (emails) {
    $or.push({
      email: {
        $in: emails,
      },
    });
  }

  if (!$or.length) {
    return [];
  }

  const data = await User.find({ $or }, { _id: true }).lean();

  if (!data.length) {
    throw new Error('No users found');
  }

  return data.map((u) => {
    return String(u._id);
  });
}

async function getLimitedUserIds() {
  const { limit } = options;
  if (!limit) {
    return [];
  }

  const data = await User.find().limit(limit).lean();

  return data.map((u) => {
    return String(u._id);
  });
}

// Sanitization

async function getSanitizations(options) {
  if (options.raw) {
    return [];
  }

  const gl = path.resolve(__dirname, 'sanitizations/*.{json,js}');
  const files = await glob(gl);
  const result = [];

  for (let file of files) {
    let definition = require(file);
    if (typeof definition === 'function') {
      definition = await definition();
    }
    const { collection, pipeline } = definition;

    if (!collection) {
      throw new Error('"collection" required in sanitization.');
    } else if (!pipeline) {
      throw new Error('"pipeline" required in sanitization.');
    }

    result.push({
      name: getSanitizedName(collection),
      ...definition,
    });
  }

  return result;
}

async function runSanitizations(connection, sanitizations) {
  for (let sanitization of sanitizations) {
    const { collection, pipeline } = sanitization;
    if (!collection) {
      throw new Error('"collection" required in sanitization.');
    } else if (!pipeline) {
      throw new Error('"pipeline" required in sanitization.');
    }

    const sanitizedName = `${collection}_sanitized`;

    try {
      // Attempt to modify the view
      await connection.db.command({
        collMod: sanitizedName,
        viewOn: collection,
        pipeline,
      });
    } catch {
      // View not created yet so create it
      await connection.createCollection(sanitizedName, {
        viewOn: collection,
        pipeline,
      });
    }
  }
}

function getSanitizedName(collection) {
  return `${collection}_sanitized`;
}

// Exporting

async function exportCollections(options) {
  const { connection, exclude, sanitizations, userIds } = options;

  const promises = [];

  for (let model of Object.values(mongoose.models)) {
    let collection = model.collection.name;

    const flags = [];

    if (exclude.includes(collection)) {
      if (collection === 'users') {
        throw new Error('Cannot exclude users.');
      }
      continue;
    } else if (isPluginCollection(collection)) {
      exclude.push(collection);
      continue;
    }

    const sanitization = sanitizations.find((s) => {
      return s.collection === collection;
    });

    if (userIds.length) {
      if (collection === 'users') {
        const query = {
          $or: [
            getFieldQuery('_id', userIds),
            {
              'roles.role': {
                $in: ['superAdmin'],
              },
            },
          ],
        };
        const tmpfile = await writeQueryFile(query);
        flags.push(`--queryFile=${tmpfile}`);
      } else {
        const userFields = Object.entries(model.schema.paths)
          .filter(([pathName, pathType]) => {
            if (!(pathType instanceof mongoose.SchemaTypes.ObjectId)) {
              return false;
            } else if (pathType.options.ref !== 'User') {
              return false;
            }

            return pathName;
          })
          .map((entry) => {
            return entry[0];
          });

        if (userFields.length) {
          const query = {
            $or: userFields.map((field) => {
              return getFieldQuery(field, userIds);
            }),
          };
          const tmpfile = await writeQueryFile(query);
          flags.push(`--queryFile=${tmpfile}`);
        }
      }
    }

    if (sanitization) {
      // Exclude original collection
      exclude.push(collection);

      // Use sanitized collection and add flags to export the view.
      flags.push('--viewsAsCollections');
      collection = sanitization.name;
    }

    if (flags.length) {
      promises.push(runExport(['-c', collection, ...flags]));
      exclude.push(collection);
    }
  }

  if (options.raw) {
    // Exclude sanitized views which may have been
    // previously created if dumping raw documents.
    const collections = await connection.db.listCollections().toArray();
    for (let collection of collections) {
      const { name } = collection;
      if (name.endsWith('_sanitized')) {
        exclude.push(name);
      }
    }
  }

  promises.push(runExport(getExcludeFlags(exclude)));

  await Promise.all(promises);
}

async function writeQueryFile(query) {
  const dir = os.tmpdir();
  const filename = `query-${Date.now()}.json`;
  const tmpfile = path.join(dir, filename);
  await fs.writeFile(tmpfile, JSON.stringify(query));
  return tmpfile;
}

// Dumping

async function runExport(flags = []) {
  const { out } = options;
  const args = [MONGO_URI, '--gzip', `--out=${out}`, ...flags];
  await exec('mongodump', args);
}

function getExcludeFlags(excludes) {
  return excludes.map((collection) => {
    return `--excludeCollection=${collection}`;
  });
}

function getFieldQuery(field, ids) {
  return {
    [field]: {
      $in: ids.map((id) => {
        return {
          // ObjectIds must be passed this way to --query
          // in mongodump as they cannot be raw strings.
          $oid: id,
        };
      }),
    },
  };
}

// Utils

function isPluginCollection(collection) {
  return collection.startsWith('plugin_');
}

function parseDate(str) {
  if (str) {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date.');
    }
    return date;
  }
}

async function exec(command, args = []) {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const child = spawn(command, args);

    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Process exited with code ${code}`));
      }
      resolve();
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error(`Fatal error: ${error.message}, exiting.`);
    process.exit(1);
  });

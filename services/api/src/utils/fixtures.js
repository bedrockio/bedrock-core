//  Fixture file structure must be:
//
//  fixtures/users/
//  fixtures/users/user-1/
//
//  Input to importFixture must be one of:
//
//  importFixtures()              // Imports all
//  importFixtures('user')        // Imports all user fixtures
//  importFixtures('user/user-1') // Imports single fixture

const path = require('path');
const mongoose = require('mongoose');
const { promises: fs } = require('fs');
const { once, memoize, camelCase, kebabCase } = require('lodash');
const { logger } = require('@bedrockio/instrumentation');
const config = require('@bedrockio/config');

const models = require('../models');
const { storeUploadedFile } = require('../utils/uploads');

const ENV = config.getAll();
const { ADMIN_EMAIL, ADMIN_PASSWORD } = ENV;

// Loads fixtures once if not loaded and returns true/false.
async function loadFixtures() {
  if (await models.User.findOne({ email: ADMIN_EMAIL })) {
    return false;
  }
  logger.info('Creating DB fixtures');
  await importFixtures();
  return true;
}

const importFixtures = memoize(async (relDir = '') => {
  const split = relDir.split(path.sep);
  if (split.length > 2) {
    throw new Error(`Invalid fixture path: ${relDir}`);
  }
  const [dirname, basename] = split;

  if (dirname) {
    const data = await resolveCustomImport(dirname);
    if (data) {
      return basename ? data[basename] : data;
    }
  }

  if (basename) {
    return await importSingle(relDir);
  } else if (dirname) {
    return await importDirectory(relDir);
  } else {
    return await importRoot();
  }
});

// Import helpers

const BASE_DIR = path.join(__dirname, '../../fixtures');

async function importRoot() {
  const entries = {};
  const names = await getSubdirectories(BASE_DIR);
  await Promise.all(
    names.map(async (name) => {
      const set = await importFixtures(name);
      for (let [key, value] of Object.entries(set)) {
        entries[path.join(name, key)] = value;
      }
      entries[name] = set;
    })
  );
  return entries;
}

async function importDirectory(relDir) {
  const entries = {};
  const names = await getSubdirectories(path.resolve(BASE_DIR, relDir));
  await Promise.all(
    names.map(async (name) => {
      entries[name] = await importFixtures(path.join(relDir, name));
    })
  );
  return entries;
}

async function importSingle(relDir) {
  const model = getModel(path.dirname(relDir));
  const dir = path.resolve(BASE_DIR, relDir);
  const attributes = require(path.join(dir, 'index.json'));
  const meta = { dir, model, relDir };
  await transformAttributes(attributes, meta);
  return await createDocumentWithGuard(model, attributes, meta);
}

const resolveCustomImport = memoize(async (relDir) => {
  const file = path.join(BASE_DIR, relDir, 'index.js');
  // Check access first to allow errors in
  // custom imports to be reported.
  if (await fileExists(file)) {
    return await require(file)();
  }
});

// Transformation helpers

const CUSTOM_PROPERTY_REG = /^<(?<func>env):(?<token>.+)>$/;
const UPLOAD_REG = /\.(jpg|png|svg|gif|webp|mp4|pdf|csv)$/;
const CONTENT_REG = /\.(md|txt|html)$/;

async function transformAttributes(attributes, meta) {
  await Promise.all(
    Object.entries(attributes).map(async ([key, value]) => {
      attributes[key] = await transformProperty([key], value, meta);
    })
  );
}

// Note that "keys" is the property path as an array.
// The naming is only to not shadow "path".
async function transformProperty(keys, value, meta) {
  if (value && typeof value === 'object') {
    // Iterate over both arrays and objects transforming them.
    await Promise.all(
      Object.entries(value).map(async ([k, v]) => {
        value[k] = await transformProperty([...keys, k], v, meta);
      })
    );
  } else if (UPLOAD_REG.test(value)) {
    value = await createUpload(path.join(meta.dir, value));
  } else if (CONTENT_REG.test(value)) {
    value = await fs.readFile(path.join(meta.dir, value));
  } else if (CUSTOM_PROPERTY_REG.test(value)) {
    value = await transformCustomProperty(value);
  } else if (isReferenceField(meta.model, keys)) {
    value = await transformReferenceField(value, keys, meta);
  }
  return value;
}

async function transformCustomProperty(value) {
  const { func, token } = value.match(CUSTOM_PROPERTY_REG).groups;
  if (func === 'env') {
    value = ENV[token];
  }
  return value;
}

// Reference field helpers

function isReferenceField(model, keys) {
  const schemaType = model.schema.path(keys.join('.'));
  return schemaType instanceof mongoose.Schema.Types.ObjectId;
}

async function transformReferenceField(value, keys, meta) {
  const model = getReferenceModel(meta.model, keys);
  const relDir = path.join(pluralKebab(model.modelName), value);
  try {
    return await importFixturesWithGuard(relDir, keys, value, meta);
  } catch {
    if (model === models.User) {
      return await createUser({ name: value });
    }
    throw new Error(`Could not import ${relDir}.`);
  }
}

function getReferenceModel(model, keys) {
  const schemaType = model.schema.path(keys.join('.'));
  return models[schemaType.options.ref];
}

// Circular reference helpers

const stack = new Set();

async function importFixturesWithGuard(relDir, keys, value, meta) {
  // If the stack includes a reference to the fixture in the middle
  // of being imported then we have a circular reference and one
  // document must be created before the other, so instead queue a
  // "post import" which will wait until all imports have settled and
  // update the document with the referenced fields.
  if (stack.has(meta.relDir)) {
    return queuePostImportSetter(meta.relDir, relDir, keys);
  } else {
    stack.add(relDir);
    return await importFixtures(relDir);
  }
}

// Create the document and run all post imports that have not yet
// resolved to update documents containing circular references.
async function createDocumentWithGuard(model, attributes, meta) {
  const doc = await createDocument(model, attributes, meta);
  await Promise.all(
    postImports.map((pi) => {
      return pi.onDocumentImported(doc, meta.relDir);
    })
  );
  return doc;
}

// Post import helpers

const postImports = [];

function queuePostImportSetter(targetId, sourceId, keys) {
  const postImport = getPostImport(targetId);
  postImport.queueSetter(sourceId, keys);
  return mongoose.Types.ObjectId().toString();
}

const getPostImport = memoize((relDir) => {
  const postImport = new PostImport(relDir);
  postImports.push(postImport);
  return postImport;
});

class PostImport {
  constructor(relDir) {
    this.relDir = relDir;
    this.setters = [];
    this.resolved = false;
  }

  queueSetter(relDir, keys) {
    this.setters.push({
      relDir,
      keys,
    });
  }

  async resolve() {
    // Set resolved up front as everything is parallel.
    this.resolved = true;

    for (let { keys, resolved } of this.setters) {
      this.doc.set(keys.join('.'), resolved);

      // Note: Unsure why this is required. Even though
      // resolved values are full mongoose objects here
      // the field becomes depopulated once it is set unless
      // .populate is called again. Additionally calling this
      // will deeply populate cylic references and not respcect
      // autopopulate: { maxDepth: 1 }, however this is acceptable
      // for our purposes here. This behavior will likely change
      // in Mongoose v6 where execPopulate is deprecated and this
      // method will return a promise.
      this.doc.populate(keys.join('.'));
    }

    await this.doc.save();
  }

  canResolve() {
    return (
      this.doc &&
      this.setters.every((setter) => {
        return setter.resolved;
      })
    );
  }

  resolveSetters(doc, relDir) {
    for (let setter of this.setters) {
      if (setter.relDir === relDir) {
        setter.resolved = doc;
      }
    }
  }

  async onDocumentImported(doc, relDir) {
    if (this.resolved) {
      return;
    }
    if (relDir === this.relDir) {
      this.doc = doc;
    } else {
      this.resolveSetters(doc, relDir);
    }
    if (this.canResolve()) {
      await this.resolve();
    }
  }
}

// Model helpers

function createDocument(model, attributes) {
  applyDefaults(model, attributes);
  return model.create(attributes);
}

function getModel(name) {
  return getModelsByName()[name];
}

const getModelsByName = once(() => {
  const modelsByName = {};
  for (let [name, model] of Object.entries(models)) {
    Object.assign(modelsByName, {
      // For mapping singular properties.
      // ie. user or userProfile
      [camelCase(name)]: model,
      // For mapping pluralized properties.
      // ie. users or userProfiles
      [pluralCamel(name)]: model,
      // For mapping directories.
      // ie. users or user-profiles
      [pluralKebab(name)]: model,
    });
  }
  return modelsByName;
});

function pluralCamel(str) {
  // Mongoose pluralize is for db collections so will lose camel casing,
  // ie UserProfile -> userprofiles. To achieve the target "userProfiles",
  // first convert to kebab, then pluralize, then back to camel.
  return camelCase(mongoose.pluralize()(kebabCase(str)));
}

function pluralKebab(str) {
  return mongoose.pluralize()(kebabCase(str));
}

// Defaults helpers

const DEFAULTS = {
  User: {
    name(attributes) {
      const { name } = attributes;
      if (name) {
        attributes.firstName = name.split(' ')[0];
        attributes.lastName = name.split(' ').slice(1).join(' ');
        delete attributes.name;
      }
      if (!attributes.firstName) {
        attributes.firstName = 'John';
      }
      if (!attributes.lastName) {
        attributes.lastName = 'Doe';
      }
    },
    email(attributes) {
      if (!attributes.email) {
        const { firstName } = attributes;
        const domain = ADMIN_EMAIL.split('@')[1];
        attributes.email = `${kebabCase(firstName)}@${domain}`;
      }
    },
    password(attributes) {
      if (!attributes.password) {
        attributes.password = ADMIN_PASSWORD;
      }
    },
  },
};

function applyDefaults(model, attributes) {
  const defaults = DEFAULTS[model.modelName] || {};
  for (let fn of Object.values(defaults)) {
    fn(attributes);
  }
}

// Upload helpers

async function createUpload(file, owner) {
  const object = await storeUploadedFile({
    path: file,
  });
  if (!owner) {
    owner = await createAdminUser();
  }
  return await createDocument(models.Upload, {
    ...object,
    owner,
  });
}

// User helpers

async function createUser(attributes) {
  return await createDocument(models.User, attributes);
}

async function createAdminUser() {
  return await importFixtures('users/admin');
}

// File helpers

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}
async function getSubdirectories(dir) {
  // TODO: time vs opendir?
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => {
      return entry.isDirectory();
    })
    .map((entry) => {
      return entry.name;
    });
}

module.exports = {
  loadFixtures,
  importFixtures,
  createAdminUser,
  createUpload,
  createUser,
};

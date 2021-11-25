// Check out the README!

const path = require('path');
const fs = require('fs/promises');
const mongoose = require('mongoose');
const { get, memoize, cloneDeep, mapKeys, camelCase, kebabCase } = require('lodash');
const { logger } = require('@bedrockio/instrumentation');
const config = require('@bedrockio/config');
const models = require('../../models');
const { storeUploadedFile } = require('../uploads');
const { stringReplaceAsync } = require('../string');

const { ADMIN_EMAIL, API_URL } = config.getAll();
const { CUSTOM_TRANSFORMS, MODEL_TRANSFORMS, ADMIN_FIXTURE_ID } = require('./const');

const BASE_DIR = path.join(__dirname, '../../../fixtures');

// Loads fixtures once if not loaded and returns true/false.
async function loadFixtures() {
  if (await models.User.findOne({ email: ADMIN_EMAIL })) {
    return false;
  }
  logger.info('Starting fixture import...');
  resetStats();
  await importFixtures();
  logStats();
  return true;
}

async function importFixtures(id = '', meta) {
  const { base, name } = getIdComponents(id);
  if (!base) {
    return await importRoot(meta);
  }
  const generated = await getGeneratedFixtures(base, name, 'imported');
  if (generated) {
    return generated;
  } else if (name) {
    return await importFixture(id, meta);
  } else {
    return await importDirectory(base, meta);
  }
}

async function importRoot(meta) {
  const bases = await getModelSubdirectories();
  return await buildFixtures(bases, async (base) => {
    const set = await importFixtures(base, meta);
    return {
      [base]: set,
      ...mapKeys(set, (doc, name) => {
        return join(base, name);
      }),
    };
  });
}

async function importDirectory(base, meta) {
  const names = await readFixturesDirectory(base);
  return await buildFixtures(names, async (name) => {
    return {
      [name]: await importFixtures(join(base, name), meta),
    };
  });
}

async function importFixture(id, meta) {
  // Imported attributes will be mutated, so clone here.
  const attributes = cloneDeep(await loadModule(id));
  return await runImport(id, attributes, meta);
}

async function runImport(id, attributes, meta) {
  const model = modelsByName[path.dirname(id)];
  meta = { id, model, meta, base: attributes };
  return createDocument(id, attributes, meta);
}

const createDocument = memoize(async (id, attributes, meta) => {
  logger.debug(`Importing: ${id}`);

  // Create the document
  await transformAttributes(attributes, meta);
  await applyModelTransforms(attributes, meta);
  const doc = await meta.model.create(attributes);

  // Post import phase
  setDocumentForPlaceholder(doc, meta.id);
  await resolvePlaceholders();
  if (documentHasPlaceholders(doc, meta)) {
    queuePlaceholderResolve(doc);
  }

  logger.debug(`Finished import: ${id}`);
  pushStat('fixtures', id);
  return doc;
});

// Property transform helpers.

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
  const isObject = value === Object(value);
  if (!isKnownField(keys, meta)) {
    // If the field is not known it might be inlined data referenced
    // elsewhere, however this is typically an array or object, so if
    // the value is a primitive it is likely bad data.
    if (!isObject) {
      logBadFixtureField(keys, value, meta);
    }
  } else if (isObject) {
    // Iterate over both arrays and objects transforming them.
    await Promise.all(
      Object.entries(value).map(async ([k, v]) => {
        value[k] = await transformProperty([...keys, k], v, meta);
      })
    );
  } else if (FILE_REG.test(value)) {
    value = await transformFile(keys, value, meta);
  } else if (CUSTOM_TRANSFORM_REG.test(value)) {
    value = await transformCustom(value, meta);
  } else if (isReferenceField(keys, meta)) {
    value = await transformReference(keys, value, meta);
  }
  return value;
}

// File transform helpers

const FILE_REG = /\.(jpg|png|svg|gif|webp|mp3|mp4|md|txt|html|pdf|csv)$/;
const INLINE_CONTENT_REG = /(\(|")([^)"\n]+?\.(?:jpg|png|svg|gif|webp|pdf))([)"])/g;
const INLINE_CONTENT_TYPES_REG = /\.(md|html)$/;

async function transformFile(keys, value, meta) {
  if (isReferenceField(keys, meta)) {
    value = await importUpload(value, meta);
  } else if (isStringField(keys, meta)) {
    value = await importContent(value, meta);
  } else if (isBufferField(keys, meta)) {
    value = await importBuffer(value, meta);
  }
  return value;
}

// Note that the same content file may be imported
// in different contexts in generator modules, so this
// function cannot be memoized.
async function importContent(file, meta) {
  file = await resolveRelativeFile(file, meta);
  return await importContentOnce(file, meta);
}

const importContentOnce = memoize(async (file, meta) => {
  let content = await fs.readFile(file, 'utf8');
  if (INLINE_CONTENT_TYPES_REG.test(file)) {
    content = await inlineContentFiles(content, meta);
  }
  return content;
});

async function inlineContentFiles(content, meta) {
  return await stringReplaceAsync(content, INLINE_CONTENT_REG, async (all, open, file, close) => {
    const upload = await importUpload(file, meta);
    // TODO: this should be /raw
    const url = `${API_URL}/1/uploads/${upload.id}/image`;
    return `${open}${url}${close}`;
  });
}

async function importBuffer(file, meta) {
  file = await resolveRelativeFile(file, meta);
  return await importBufferOnce(file, meta);
}

const importBufferOnce = memoize(async (file) => {
  return await fs.readFile(file);
});

// Model transform helpers

async function applyModelTransforms(attributes, meta) {
  const transforms = MODEL_TRANSFORMS[meta.model.modelName] || {};
  await Promise.all(
    Object.values(transforms).map(async (fn) => {
      return await fn(attributes, meta, {
        importFixtures,
      });
    })
  );
}

// Custom transform helpers

const CUSTOM_TRANSFORM_REG = /^<(?<func>\w+):(?<token>.+)>$/;

async function transformCustom(value, meta) {
  const { func, token } = value.match(CUSTOM_TRANSFORM_REG).groups;
  const transform = CUSTOM_TRANSFORMS[func];
  if (!transform) {
    throw new Error(`Custom transform "${func}" not recognized.`);
  }
  return await transform(token, meta, {
    importFixtures,
  });
}

// Upload helpers

// For now uploads are not listed out in fixtures directories like
// the other models, so this creates a pseudo fixture with the id
// set to the file path.
async function importUpload(file, meta) {
  file = await resolveRelativeFile(file, meta);
  return await importUploadOnce(file, meta);
}

const importUploadOnce = memoize(async (file, meta) => {
  const attributes = await storeUploadedFile({
    path: file,
  });
  if (meta.id !== ADMIN_FIXTURE_ID) {
    // As a special case to bootstrap the admin user, allow their
    // profile image to not have an owner to sidestep the circular
    // reference user.profileImage -> image.owner -> user.
    // All other images will be owned by the admin user for now.
    attributes.owner = await importFixtures(ADMIN_FIXTURE_ID, {
      id: file,
      meta,
    });
  }
  return await models.Upload.create(attributes);
});

// Generated modules may cross-reference other fixtures, in which
// case relative file paths will be one level up, so test both directories.
async function resolveRelativeFile(file, meta) {
  if (await fileExists(path.resolve(BASE_DIR, meta.id, file))) {
    return path.resolve(BASE_DIR, meta.id, file);
  } else {
    return path.resolve(BASE_DIR, meta.id, '..', file);
  }
}

// Field helpers

function isReferenceField(keys, meta) {
  const schemaType = getSchemaType(keys, meta);
  return schemaType instanceof mongoose.Schema.Types.ObjectId;
}

function isStringField(keys, meta) {
  const schemaType = getSchemaType(keys, meta);
  return schemaType instanceof mongoose.Schema.Types.String;
}

function isBufferField(keys, meta) {
  const schemaType = getSchemaType(keys, meta);
  return schemaType instanceof mongoose.Schema.Types.Buffer;
}

// A "known" field is either defined in the schema or
// a custom field that will later be transformed.
function isKnownField(keys, meta) {
  const schemaType = getSchemaType(keys, meta);
  if (schemaType) {
    return true;
  } else if (keys.length > 1) {
    return false;
  }
  const transform = MODEL_TRANSFORMS[meta.model.modelName];
  return transform && keys[0] in transform;
}

async function transformReference(keys, value, meta) {
  // Reference fields may have already resolved, in which
  // case they will be an ObjectId so simply return it.
  if (typeof value !== 'string') {
    return value;
  }
  const model = getReferenceModel(keys, meta);
  const id = join(pluralKebab(model.modelName), value);
  return await importFixturesWithGuard(id, meta);
}

function getReferenceModel(keys, meta) {
  const schemaType = getSchemaType(keys, meta);
  let { ref, refPath } = schemaType.options;
  if (!ref && refPath) {
    ref = get(meta.base, refPath);
  }
  return models[ref];
}

function getSchemaType(keys, meta) {
  return meta.model.schema.path(keys.join('.'));
}

// Fixtures with circular references will hang importing
// so guard against this and fall back to placeholders.
// Warn when this is due to circular references in the
// graph as this is not ideal, however it also may happen
// with recursive references in generated modules which
// are resolved as a whole.
async function importFixturesWithGuard(id, meta) {
  try {
    checkGeneratedConflict(id, meta);
    checkCircularReferences(id, meta);
    return await importFixtures(id, meta);
  } catch (err) {
    if (err instanceof CircularReferenceError) {
      logCircularReference(err.toString());
      return getReferencedPlaceholder(id);
    } else if (err instanceof GeneratedConflictError) {
      logger.debug(`Generated conflict in ${id}. Falling back to placeholder.`);
      return getReferencedPlaceholder(id);
    } else {
      throw err;
    }
  }
}

// Circular reference helpers

class CircularReferenceError extends Error {
  constructor(ids) {
    super();
    this.ids = ids;
  }

  toString() {
    return this.ids.join(' -> ');
  }
}

function checkCircularReferences(id, meta) {
  const ids = [id];
  while (meta) {
    ids.unshift(meta.id);
    if (meta.id === id) {
      throw new CircularReferenceError(ids);
    }
    meta = meta.meta;
  }
}

// Memoize these messages to prevent multiple logs
// for the same reference when importing recursively.

const logBadFixtureField = memoize(
  (keys, value, meta) => {
    const prop = keys.join('.');
    const str = JSON.stringify(value);
    logger.warn(`Possible bad data in ${meta.id} -> "${prop}": ${str}`);
  },
  (keys, value, meta) => {
    // Memoize per fixture, path, and value;
    return meta.id + keys.join('.') + value;
  }
);

const logCircularReference = memoize((message) => {
  logger.warn('Circular reference detected:', message);
  pushStat('circular', message);
});

// Generated module helpers.

async function getGeneratedFixtures(base, name, type) {
  const generated = await importGeneratedFixtures(base);
  if (generated) {
    let fixtures = generated[type];
    if (name) {
      fixtures = fixtures[name];
      if (!fixtures) {
        throw new Error(`Could not import ${join(base, name)} from generated directory ${base}.`);
      }
    }
    return fixtures;
  }
}

const importGeneratedFixtures = memoize(async (base) => {
  let loaded, imported;
  const generateFixtureId = getFixtureIdGenerator(base);
  try {
    loaded = await loadModule(base, {
      generateFixtureId,
      loadFixtureModules,
    });
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      logger.debug(`No generated module found for ${base}`);
      return;
    } else {
      throw err;
    }
  }
  if (loaded) {
    pushStat('modules', base);
    if (Array.isArray(loaded)) {
      loaded = mapKeys(loaded, generateFixtureId);
    }
    const meta = { generated: base };

    // Imported attributes will be mutated, so do a deep clone
    // to ensure that loaded fixtures will be unchanged. This allows
    // generated fixtures to reference others and retain the fixture
    // references exported by the generated module.
    imported = cloneDeep(loaded);

    imported = await buildFixtures(Object.entries(imported), async ([name, attributes]) => {
      return {
        [name]: await runImport(join(base, name), attributes, meta),
      };
    });
    return {
      loaded,
      imported,
    };
  }
});

class GeneratedConflictError extends Error {}

// Generated modules may contain recursive references.
// If they do we need to throw an error to allow a fallback.
function checkGeneratedConflict(id, meta) {
  const base = getIdBase(id);
  const context = getGeneratedContext(meta);
  if (context === base) {
    throw new GeneratedConflictError();
  }
}

function getGeneratedContext(meta) {
  while (meta) {
    if (meta.generated) {
      return meta.generated;
    }
    meta = meta.meta;
  }
}

// Allow generators to load raw modules to reference them.
async function loadFixtureModules(id) {
  const { base, name } = getIdComponents(id);
  const generated = await getGeneratedFixtures(base, name, 'loaded');
  if (generated) {
    return generated;
  }
  const names = await readFixturesDirectory(base);
  return await buildFixtures(names, async (name) => {
    return {
      [name]: await loadModule(join(base, name)),
    };
  });
}

// Auto-increment generator for base.
function getFixtureIdGenerator(base) {
  const singular = kebabCase(modelsByName[base].modelName);
  let counter = 0;
  return () => {
    return `${singular}-${++counter}`;
  };
}

// Placeholder helpers

let placeholdersById = new Map();
let documentsByPlaceholder = new Map();
let referencedPlaceholders = new Map();
let unresolvedDocuments = new Set();

function queuePlaceholderResolve(doc) {
  unresolvedDocuments.add(doc);
}

async function resolvePlaceholders() {
  await Promise.all(
    Array.from(unresolvedDocuments).map(async (doc) => {
      resolveDocumentPlaceholders(doc);
      if (!documentHasPlaceholders(doc)) {
        if (doc.isModified()) {
          await doc.save();
        }
        unresolvedDocuments.delete(doc);
      }
    })
  );
}

function resolveDocumentPlaceholders(doc) {
  for (let [placeholder, path] of getDocumentPlaceholders(doc)) {
    const resolved = getDocumentForPlaceholder(placeholder);
    if (resolved) {
      doc.set(path, resolved);
    }
  }
}

function getDocumentPlaceholders(doc) {
  const placeholders = [];
  doc.schema.eachPath((path, schemaType) => {
    if (schemaType instanceof mongoose.Schema.Types.ObjectId) {
      // Get the ObjectId for the path. If the path is populated
      // then the poorly named "populated" will return the id,
      // otherwise get the direct property.
      const objectId = doc.populated(path) || doc.get(path);
      if (isReferencedPlaceholder(objectId)) {
        placeholders.push([objectId, path]);
      }
    }
  });
  return placeholders;
}

function documentHasPlaceholders(doc, meta) {
  return getDocumentPlaceholders(doc, meta).length > 0;
}

function getDocumentForPlaceholder(placeholder) {
  return documentsByPlaceholder.get(placeholder.toString());
}

function setDocumentForPlaceholder(doc, id) {
  const placeholder = getPlaceholderForId(id);
  documentsByPlaceholder.set(placeholder.toString(), doc);
}

function getReferencedPlaceholder(id) {
  const placeholder = getPlaceholderForId(id);
  referencedPlaceholders.set(placeholder.toString(), id);
  return placeholder;
}

function isReferencedPlaceholder(objectId) {
  return referencedPlaceholders.has(objectId?.toString());
}

// Generates a placeholder once per id.
const getPlaceholderForId = memoize((id) => {
  const placeholder = mongoose.Types.ObjectId();
  placeholdersById.set(id, placeholder.toString());
  return placeholder;
});

function cleanupPlaceholders() {
  placeholdersById = new Map();
  documentsByPlaceholder = new Map();
  referencedPlaceholders = new Map();
  unresolvedDocuments = new Set();
  getPlaceholderForId.cache.clear();
}

// Module helpers

// Allow node to resolve index.json or index.js. If the
// default export is a function then call it asynchronously.
// Memoize as the function may have side effects.
const loadModule = memoize(async (id, args) => {
  const file = require.resolve(path.join(BASE_DIR, id));

  logger.debug(`Loading ${file}`);

  const module = require(file);

  if (typeof module === 'function') {
    return await module(args);
  } else {
    return module;
  }
});

// Model helpers

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

function pluralCamel(str) {
  // Mongoose pluralize is for db collections so will lose camel casing,
  // ie UserProfile -> userprofiles. To achieve the target "userProfiles",
  // first convert to kebab, then pluralize, then back to camel.
  return camelCase(mongoose.pluralize()(kebabCase(str)));
}

function pluralKebab(str) {
  return mongoose.pluralize()(kebabCase(str));
}

// File system helpers

async function fileExists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

async function getModelSubdirectories() {
  const names = await readFixturesDirectory();
  return names.filter((name) => {
    return modelsByName[name];
  });
}

async function readFixturesDirectory(dir = '') {
  const entries = await fs.readdir(path.resolve(BASE_DIR, dir), { withFileTypes: true });
  return entries
    .filter((entry) => {
      if (entry.isDirectory()) {
        return true;
      } else {
        return dir && path.extname(entry.name) === '.json';
      }
    })
    .map((entry) => {
      return entry.name;
    });
}

// Fixture id helpers

function join(base, name) {
  return [base, name].join('/');
}

function getIdComponents(id) {
  const [base, name, ...rest] = id.split('/');
  if (rest.length) {
    throw new Error(`Invalid fixture id: ${id}`);
  }
  return { base, name };
}

function getIdBase(id) {
  return getIdComponents(id).base;
}

// Stats helpers

let stats;

function pushStat(type, value) {
  if (stats) {
    stats[type].push(value);
  }
}

function logStats() {
  logger.info();
  logger.info('------------- Import Stats ---------------');
  logger.info();
  logger.info(getStat(stats.fixtures.length, 'fixture', 'imported'));
  logStatsBlock('Custom modules found:', stats.modules);
  logStatsBlock('Circular references found:', stats.circular);
  logStatsBlock('Referenced placeholders:', referencedPlaceholders);
  logger.info();
  logger.info('------------------------------------------');
  logger.info();
}

function getStat(num, unit, msg) {
  return `${num} ${num === 1 ? unit : pluralCamel(unit)} ${msg}`;
}

function logStatsBlock(msg, collection) {
  const isMap = collection instanceof Map;
  if (isMap ? collection.size : collection.length) {
    logger.info();
    logger.info(msg);
    for (let entry of collection) {
      logger.info(' ', isMap ? `${entry[0]} -> ${entry[1]}` : entry);
    }
  }
}

function resetStats() {
  stats = {
    fixtures: [],
    modules: [],
    circular: [],
  };
}

// Cleanup helpers

// Remove references that may be
// holding large amounts of memory.
function resetFixtures() {
  cleanupPlaceholders();
  createDocument.cache.clear();
  importGeneratedFixtures.cache.clear();
  importUploadOnce.cache.clear();
  importBufferOnce.cache.clear();
  importContentOnce.cache.clear();
  logBadFixtureField.cache.clear();
  logCircularReference.cache.clear();
  loadModule.cache.clear();
}

// Utils

async function buildFixtures(arr, fn) {
  const fixtures = {};
  await Promise.all(
    arr.map(async (el) => {
      Object.assign(fixtures, await fn(el));
    })
  );
  return fixtures;
}

module.exports = {
  loadFixtures,
  resetFixtures,
  importFixtures,
};

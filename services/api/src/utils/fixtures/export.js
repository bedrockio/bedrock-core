const path = require('path');
const Zip = require('jszip');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const { Writable } = require('stream');
const { camelUpper, kebabCase, pluralKebab, pluralCamel } = require('./utils');
const { createWriteStream, promises: fs } = require('fs');
const { stringReplaceAsync } = require('../string');
const { memoize, set, isPlainObject } = require('lodash');
const { logger } = require('@bedrockio/instrumentation');

const models = require('./models');

const EXPORT_FILE = 'export.zip';

async function exportFixtures(options) {
  let { modelNames = [], ids = [] } = options;
  if (!modelNames.length) {
    throw new Error('Model name is required.');
  }
  const zip = new Zip();
  const set = modelNames.map((name) => {
    const model = models[camelUpper(name)];
    if (!model) {
      throw new Error(`Could not find model "${name}.`);
    }
    return {
      name,
      model,
      count: 0,
    };
  });

  if (!options.stdout) {
    logger.info('Starting fixture export...');
  }

  await Promise.all(
    set.map(async (set) => {
      const docs = await set.model.find({
        ...(ids.length && {
          _id: { $in: ids },
        }),
      });
      set.count += docs.length;
      await Promise.all(
        docs.map(async (doc) => {
          await exportDocument(doc, zip);
        })
      );
    })
  );
  await outputZip(zip, options);
  if (!options.stdout) {
    logger.info();
    logger.info('------------- Export Stats ---------------');
    logger.info();
    for (let { name, count } of set) {
      logger.info(`Exported ${count} ${pluralCamel(name)}.`);
    }
    logger.info();
    logger.info('------------------------------------------');
    logger.info();
    logger.info(`Written to: ${EXPORT_FILE}`);
  }
}

async function exportDocument(doc, zip) {
  doc.depopulate();
  const obj = doc.toObject({
    scopes: ['admin'],
  });

  delete obj.id;
  delete obj.createdAt;
  delete obj.updatedAt;

  const dir = getIdForDocument(doc);
  const file = path.join(dir, 'index.json');

  await walkFields(obj, async (val, key, isRef) => {
    if (isRef) {
      const model = doc.constructor;
      const schemaType = model.schema.path(key);

      if (!schemaType) {
        return;
      }

      const { ref } = schemaType.options;
      const refModel = models[ref];
      const refDoc = await refModel.findById(val);
      if (refModel.modelName === 'Upload') {
        const { filename } = refDoc;
        set(obj, key, filename);
        const file = path.join(dir, filename);
        await writeUpload(refDoc, file, zip);
      } else {
        set(obj, key, getNameForDocument(refDoc));
        await exportDocument(refDoc, zip);
      }
    } else if (isMarkdown(val)) {
      val = await exportInlinedMarkdownImages(val, dir, zip);
      const filename = key.split('.').slice(-1)[0] + '.md';
      const file = path.join(dir, filename);
      set(obj, key, filename);
      writeToZip(file, val, zip);
    } else if (isText(val)) {
      const filename = key.split('.').slice(-1)[0] + '.txt';
      const file = path.join(dir, filename);
      set(obj, key, filename);
      writeToZip(file, val, zip);
    }
  });
  writeToZip(file, obj, zip);
}

const MARKDOWN_REG = /^#{1,6} |\[.+?\]\(.+?\)|(\*\*|__)(?:(?!\n\n).)+\1|\n\n/ms;

function isMarkdown(str) {
  return typeof str === 'string' && MARKDOWN_REG.test(str);
}

function isText(str) {
  return typeof str === 'string' && str.length > 150;
}

const INLINE_IMAGE_REG = /!\[(.+?)\]\((.+?\/1\/uploads\/(.*?)\/(raw|image))\)/g;

async function exportInlinedMarkdownImages(str, dir, zip) {
  return await stringReplaceAsync(str, INLINE_IMAGE_REG, async (all, text, link, id) => {
    const upload = await models.Upload.findById(id);
    if (upload) {
      const { filename } = upload;
      const file = path.join(dir, filename);
      await writeUpload(upload, file, zip);
      link = filename;
    }
    return `![${text}](${link})`;
  });
}

async function writeUpload(upload, file, zip) {
  const { storageType, rawUrl } = upload;
  if (storageType === 'local') {
    const raw = await fs.readFile(rawUrl);
    writeToZip(file, raw, zip);
  } else if (storageType === 'gcs') {
    const res = await fetch(rawUrl);
    const blob = await res.blob();
    writeToZip(file, blob.stream(), zip);
  }
}

function getIdForDocument(doc) {
  const base = pluralKebab(doc.constructor.modelName);
  return path.join(base, getNameForDocument(doc));
}

function getNameForDocument(doc) {
  const { slug, name, fullName } = doc;
  if (slug) {
    return slug;
  } else if (name || fullName) {
    return kebabCase(name || fullName);
  } else {
    return generateNameForModel(doc.constructor.modelName);
  }
}

function generateNameForModel(modelName) {
  return getNameGeneratorForModel(modelName)();
}

const getNameGeneratorForModel = memoize((modelName) => {
  const base = kebabCase(modelName);
  let counter = 1;
  return () => `${base}-${counter++}`;
});

async function walkFields(obj, fn) {
  await Promise.all(walkField(obj, fn));
}

function walkField(field, fn, path = [], promises = []) {
  const isRef = field instanceof mongoose.Types.ObjectId;
  const isObject = field === Object(field);
  if (isObject && !isRef) {
    for (let [key, val] of Object.entries(field)) {
      walkField(val, fn, [...path, key], promises);
    }
  } else {
    promises.push(fn(field, path.join('.'), isRef));
  }
  return promises;
}

function writeToZip(file, content, zip) {
  if (isPlainObject(content)) {
    content = JSON.stringify(content, null, 2);
  }
  zip.file(`fixtures/${file}`, content);
}

function outputZip(zip, options) {
  return new Promise((resolve, reject) => {
    const stream = createStream(options);
    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
      .pipe(stream)
      .on('error', (err) => {
        reject(err);
      })
      .on('finish', () => {
        resolve();
      });
  });
}

function createStream(options) {
  if (options.stdout) {
    return new Writable({
      write(chunk, encoding, callback) {
        process.stdout.write(chunk, callback);
      },
    });
  } else {
    return createWriteStream(options.filename || EXPORT_FILE);
  }
}

module.exports = {
  exportFixtures,
};

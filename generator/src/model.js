const { assertPath } = require('./util');
const { outputSchema } = require('./schema');
const { yellow } = require('kleur');

const {
  readSourceFile,
  writeLocalFile,
  replaceBlock,
  replacePrimary,
} = require('./source');

const MODELS_DIR = 'services/api/src/models';

async function generateModel(options) {
  const { camelLower } = options;

  const modelsDir = await assertPath(MODELS_DIR);

  let source = await readSourceFile(modelsDir, 'shop.js');
  source = replacePrimary(source, options);
  source = replaceBlock(source, outputSchema(options.schema), 'schema');
  source = replaceBlock(source, getRequires(options.schema), 'requires');
  source = replaceBlock(source, getAutopopulate(options.schema), 'autopopulate');
  await writeLocalFile(source, modelsDir, `${camelLower}.js`);

  console.log(yellow('Model generated!'));
}

function getRequires(schema) {
  if (hasObjectId(schema)) {
    return 'const { ObjectId } = mongoose.Schema.Types;';
  }
}

function getAutopopulate(schema) {
  if (hasObjectId(schema)) {
    return "schema.plugin(require('mongoose-autopopulate'));";
  }
}

function hasObjectId(schema) {
  return schema.some((field) => {
    return field.schemaType === 'ObjectId';
  });
}

module.exports = {
  generateModel,
};

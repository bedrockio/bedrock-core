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
  await writeLocalFile(source, modelsDir, `${camelLower}.js`);

  console.log(yellow('Model generated!'));
}

module.exports = {
  generateModel,
};

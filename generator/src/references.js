const prompt = require('./prompt');
const { readLocalDirectory } = require('./source');
const { validateCamelUpper } = require('./validations');
const { getCamelLower, getPlural } = require('./lang');
const { assertPath } = require('./util');

const MODELS_DIR = 'services/api/src/models';
const MODEL_NAME_REG = /mongoose.(?:models.|model\(')(\w+)/;

async function getForeignReferences(options) {
  const { camelUpper } = options;

  const modelsDir = await assertPath(MODELS_DIR);

  const models = (await readLocalDirectory(modelsDir))
    .map((source) => {
      const match = source.match(MODEL_NAME_REG);
      return match && match[1];
    })
    .filter((name) => {
      return name && name !== camelUpper;
    });

  const names = await prompt({
    type: 'multiselect',
    name: 'reference',
    instructions: false,
    message: 'Secondary References:',
    choices: models.map((name) => {
      return {
        title: name,
        value: name,
        description: `Generates a ${camelUpper}${getPlural(name)} screen.`,
      };
    }),
    hint: 'Space to select',
  });

  const references = [];

  for (let name of names) {
    const pluralUpper = await prompt({
      type: 'text',
      validate: validateCamelUpper,
      initial: getPlural(name),
      message: `Confirm plural name for ${name}:`,
    });
    const camelLower = getCamelLower(camelUpper);
    const pluralLower = getCamelLower(pluralUpper);
    references.push({
      camelLower,
      camelUpper,
      pluralLower,
      pluralUpper,
    });
  }

  return references;
}

module.exports = {
  getForeignReferences
};

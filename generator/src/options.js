const yargs = require('yargs');
const prompt = require('./prompt');
const { kebabCase } = require('lodash');
const { saveSnapshot, restoreSnapshot } = require('./snapshot');

const { getSchema } = require('./schema');
const { readLocalDirectory } = require('./source');
const { validateCamelUpper } = require('./validations');
const { getCamelLower, getPlural } = require('./lang');
const { assertPath } = require('./util');

const argv = yargs.array('generate').array('reference').argv;

async function getOptions() {
  const snapshot = await restoreSnapshot(argv.snapshot);

  prompt.override({
    ...argv,
    ...snapshot,
  });

  const { camelUpper, pluralUpper } = await prompt([
    {
      type: 'text',
      name: 'camelUpper',
      validate: validateCamelUpper,
      message: 'Name of resource in singular camel case (ex. UserImage):',
    },
    {
      type: 'text',
      name: 'pluralUpper',
      validate: validateCamelUpper,
      initial: getPlural,
      message: 'Confirm plural name in camel case (ex. UserImages):',
    },
  ]);

  const camelLower = getCamelLower(camelUpper);
  const pluralLower = getCamelLower(pluralUpper);

  // Prevent having to avoid generic names when
  // gathering the/ schema due to overrides.
  prompt.override(null);

  const schema = await getSchema(snapshot.schema);

  const topLevelRoute = `/${kebabCase(pluralUpper)}`;

  const generate = await prompt({
    type: 'multiselect',
    name: 'generate',
    instructions: false,
    message: 'Generate:',
    choices: [
      {
        title: 'Model',
        value: 'model',
        selected: true,
        description: 'Generates Mongoose models.',
      },
      {
        title: 'Routes',
        value: 'routes',
        selected: true,
        description: 'Generates API routes.',
      },
      {
        title: 'Screens',
        value: 'screens',
        selected: true,
        description: `Generates top level screens for ${topLevelRoute}`,
      },
      {
        title: 'Subscreens',
        value: 'subscreens',
        selected: true,
        description: 'Generates sub level screens for references.',
      },
      {
        title: 'Modals',
        value: 'modals',
        selected: true,
        description: 'Generates create/update modals.',
      },
      {
        title: 'Menu Link',
        value: 'menu',
        selected: true,
        description: `Generates a link in the main menu to ${topLevelRoute}`,
      },
    ],
    hint: 'Space to select',
  });

  const options = {
    schema,
    generate,
    camelUpper,
    camelLower,
    pluralUpper,
    pluralLower,
  };

  if (generate.includes('subscreens')) {
    options.externalSubScreens = await getExternalSubScreens(options);
    options.subScreens = await getSubScreens(options);
  }

  await saveSnapshot(options, argv.capture);

  return options;
}

async function getExternalSubScreens(options) {
  return (
    await Promise.all(
      options.schema
        .filter((field) => {
          return field.type === 'ObjectId';
        })
        .map(async (field) => {
          const { ref, refPlural } = field;
          const yes = await prompt({
            type: 'confirm',
            message: `Generate ${field.ref}${options.pluralUpper} screen?`,
          });
          if (yes) {
            return {
              camelUpper: ref,
              pluralUpper: refPlural,
              camelLower: getCamelLower(ref),
              pluralLower: getCamelLower(refPlural),
            };
          }
        })
    )
  ).filter((ref) => ref);
}

async function getSubScreens(options) {
  const { camelUpper } = options;

  const references = [];

  const modelNames = await getModelNames(options);

  let selectedNames = await prompt({
    type: 'multiselect',
    instructions: false,
    message: 'Generate sub-screens for:',
    choices: modelNames
      .map((name) => {
        return {
          title: name,
          value: name,
          description: `Generates ${camelUpper}${getPlural(name)} screen.`,
        };
      })
      .concat({
        title: 'Other',
        value: 'other',
        description: `Enter manually.`,
      }),
    hint: 'Space to select or Enter for none.',
  });

  if (selectedNames.includes('other')) {
    const otherNames = await prompt({
      type: 'list',
      message: 'Comma separated models (ex. Video, UserImage):',
      validate: (str) => {
        const arr = str.split(/,\s*/);
        for (let el of arr) {
          if (validateCamelUpper(el) !== true) {
            return 'Please enter names in upper camel case.';
          }
        }
        return true;
      },
    });

    selectedNames = selectedNames.filter((name) => name !== 'other');
    selectedNames = selectedNames.concat(otherNames);
  }

  for (let camelUpper of selectedNames) {
    const pluralUpper = await prompt({
      type: 'text',
      name: `${camelUpper}Plural`,
      validate: validateCamelUpper,
      initial: getPlural(camelUpper),
      message: `Confirm plural name for ${camelUpper}:`,
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

const MODELS_DIR = 'services/api/src/models';
const MODEL_NAME_REG = /mongoose.(?:models.|model\(')(\w+)/;

async function getModelNames(options) {
  const { camelUpper } = options;

  const modelsDir = await assertPath(MODELS_DIR);

  return (await readLocalDirectory(modelsDir))
    .map((source) => {
      const match = source.match(MODEL_NAME_REG);
      return match && match[1];
    })
    .filter((name) => {
      return name && name !== camelUpper;
    });
}

module.exports = {
  getOptions,
};

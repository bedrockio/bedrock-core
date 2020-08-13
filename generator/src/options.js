const yargs = require('yargs');
const prompt = require('./prompt');
const { saveSnapshot, restoreSnapshot } = require('./snapshot');

const { getSchema } = require('./schema');
const { getForeignReferences } = require('./references');
const { validateCamelUpper } = require('./validations');
const { getCamelLower, getPlural } = require('./lang');

const argv = yargs
  .array('generate')
  .array('reference')
  .argv;


const GENERATE_OPTIONS = [
  {
    title: 'Model',
    value: 'model',
    selected: true,
    description: 'Generates Mongoose models.',
    types: ['primary', 'secondary'],
  },
  {
    title: 'Routes',
    value: 'routes',
    selected: true,
    description: 'Generates API routes.',
    types: ['primary', 'secondary'],
  },
  {
    title: 'Screens',
    value: 'screens',
    selected: true,
    description: 'Generates screens and React routes.',
    types: ['primary'],
  },
  {
    title: 'Modals',
    value: 'modals',
    selected: true,
    description: 'Generates create/update modals.',
    types: ['primary', 'secondary'],
  },
  {
    title: 'Menu Link',
    value: 'menu',
    selected: true,
    description: 'Generates a link in the main menu.',
    types: ['primary'],
  },
];

async function getOptions() {

  const snapshot = await restoreSnapshot(argv.snapshot);

  //const foo = {
    //...argv,
    //...await restoreSnapshot(argv.snapshot),
  //};

  prompt.override({
    ...argv,
    ...snapshot,
  });

  const { type, generate, camelUpper, pluralUpper } = await prompt([
    {
      type: 'select',
      name: 'type',
      instructions: false,
      message: 'Resource Type:',
      choices: [
        {
          title: 'Primary',
          value: 'primary',
          description: 'A first-class resource. Can generate screens and a menu link.',
        },
        {
          title: 'Secondary',
          value: 'secondary',
          description: 'A child in a has-one/has-many relationship. Will not generate screens or a menu link.',
        },
      ],
      hint: 'Select One',
    },
    {
      type: 'multiselect',
      name: 'generate',
      instructions: false,
      message: 'Generate:',
      choices: (type) => {
        return GENERATE_OPTIONS.filter((opt) => {
          return opt.types.includes(type);
        });
      },
      hint: 'Space to select',
    },
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
      message: 'Enter plural name in camel case (ex. UserImages):',
    },
  ]);

  prompt.override(null);

  const camelLower = getCamelLower(camelUpper);
  const pluralLower = getCamelLower(pluralUpper);

  const options = {
    type,
    generate,
    camelUpper,
    camelLower,
    pluralUpper,
    pluralLower,
  };

  if (generate.includes('screens')) {
    options.references = await getForeignReferences(options);
  } else {
    options.references = [];
  }

  options.schema = await getSchema(snapshot.schema);

  if (argv.capture) {
    await saveSnapshot(options, argv.capture);
  }

  return options;
}


module.exports = {
  getOptions
};

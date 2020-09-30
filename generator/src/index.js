const { green, white } = require('kleur');
const { getOptions } = require('./options');
const { generateModel } = require('./model');
const { generateRoutes } = require('./routes');
const { generateModals } = require('./modals');
const { patchMainMenu } = require('./patches');
const {
  generateScreens,
  generateSubScreens,
} = require('./screens');

async function generateResource() {

  console.log(`
    ${green('Bedrock Resource Generator')}
    ${white('For more see README.md')}
  `);

  const options = await getOptions();

  if (options.generate.includes('model')) {
    await generateModel(options);
  }
  if (options.generate.includes('routes')) {
    await generateRoutes(options);
  }
  if (options.generate.includes('screens')) {
    await generateScreens(options);
  }
  if (options.generate.includes('subscreens')) {
    await generateSubScreens(options);
  }
  if (options.generate.includes('modals')) {
    await generateModals(options);
  }
  if (options.generate.includes('menu')) {
    await patchMainMenu(options);
  }
}

module.exports = {
  generateResource,
};

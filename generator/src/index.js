
const { getOptions } = require('./options');
const { generateModel } = require('./model');
const { generateRoutes } = require('./routes');
const { generateScreens } = require('./screens');
const { generateModals } = require('./modals');
const { patchMainMenu } = require('./patches');

async function generateResource() {
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
  if (options.generate.includes('modals')) {
    await generateModals(options);
  }
  if (options.generate.includes('menu')) {
    await patchMainMenu(options);
  }
}

module.exports = {
  generateResource,
}

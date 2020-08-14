const { yellow } = require('kleur');
const { assertPath } = require('./util');
const { replaceInputs } = require('./inputs');
const { patchIndex } = require('./patches');

const {
  readSourceFile,
  writeLocalFile,
  replacePrimary,
  replaceSecondary,
} = require('./source');

const MODALS_DIR = 'services/web/src/modals';

async function generateModals(options) {
  const { type, camelUpper } = options;

  const modalsDir = await assertPath(MODALS_DIR);

  let source;
  if (type === 'primary') {
    source = await readSourceFile(modalsDir, 'EditShop.js');
    source = replacePrimary(source, options);
  } else {
    source = await readSourceFile(modalsDir, 'EditProduct.js');
    source = replacePrimary(source, options.primaryReference);
    source = replaceSecondary(source, options);
  }

  source = replaceInputs(source, options);
  await writeLocalFile(source, modalsDir, `Edit${camelUpper}.js`);

  await patchIndex(modalsDir, `Edit${camelUpper}`);

  console.log(yellow('Modals generated!'));
}

module.exports = {
  generateModals,
};

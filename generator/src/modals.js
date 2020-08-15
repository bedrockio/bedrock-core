const { yellow } = require('kleur');
const { assertPath } = require('./util');
const { replaceInputs } = require('./inputs');
const { patchIndex } = require('./patches');

const {
  readSourceFile,
  writeLocalFile,
  replacePrimary,
  replaceSecondary,
  replaceBlock,
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
  source = replaceImports(source, options);

  source = replaceInputs(source, options);
  await writeLocalFile(source, modalsDir, `Edit${camelUpper}.js`);

  await patchIndex(modalsDir, `Edit${camelUpper}`);

  console.log(yellow('Modals generated!'));
}

function replaceImports(source, options) {
  const { schema } = options;

  const imports = [];
  if (schema.some((field) => field.type === 'Date')) {
    imports.push("import DateField from 'components/form-fields/Date';");
  }

  if (schema.some((field) => field.type.match(/Upload/))) {
    imports.push("import UploadsField from 'components/form-fields/Uploads';");
  }

  if (schema.some((field) => field.type.match(/ObjectId/))) {
    imports.push("import ReferenceField from 'components/form-fields/Reference';");
  }

  if (imports.length) {
    source = replaceBlock(source, imports.join('\n'), 'imports');
  }

  return source;
}

module.exports = {
  generateModals,
};

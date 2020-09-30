const { yellow } = require('kleur');
const { assertPath, block } = require('./util');
const { replaceInputs } = require('./inputs');
const { patchIndex } = require('./patches');
const { getCamelLower } = require('./lang');

const {
  readSourceFile,
  writeLocalFile,
  replaceSecondary,
  replaceBlock,
} = require('./source');

const MODALS_DIR = 'services/web/src/modals';

async function generateModals(options) {
  const { camelUpper } = options;

  const modalsDir = await assertPath(MODALS_DIR);

  let source = await readSourceFile(modalsDir, 'EditProduct.js');
  source = replaceSecondary(source, options);
  source = replaceRefs(source, options);
  source = replaceNameReference(source, options);
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

  if (schema.some((field) => field.currency)) {
    imports.push("import CurrencyField from 'components/form-fields/Currency';");
  }

  source = replaceBlock(source, imports.join('\n'), 'imports');

  return source;
}

function replaceRefs(source, options) {
  const { schema } = options;

  const refs = schema
    .filter((field) => {
      return field.type === 'ObjectId';
    }).map((field) => {
      const camelLower = getCamelLower(field.ref);
      return block`
        ...(this.props.${camelLower} && {
          ${camelLower}: this.props.${camelLower}.id,
        }),
      `;
    });

  source = replaceBlock(source, refs.join('\n'), 'refs');

  return source;
}

function replaceNameReference(source, options) {
  const { camelUpper } = options;
  const hasName = options.schema.some((field) => field.name === 'name');

  if (!hasName) {
    // If the schema has no "name" field then don't
    // rely on it for the modal title.
    source = source.replace(/Edit "\${.+?}"/, `Edit ${camelUpper}`);
  }

  return source;
}

module.exports = {
  generateModals,
};

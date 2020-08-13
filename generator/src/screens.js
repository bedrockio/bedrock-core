const { yellow } = require('kleur');
const { replaceFilters } = require('./filters');
const { assertPath, mkdir, block } = require('./util');
const { patchAppEntrypoint, patchIndex } = require('./patches');
const {
  readSourceFile,
  writeLocalFile,
  replaceBlock,
  replacePrimary,
  replaceSecondary,
} = require('./source');

const FILES = ['index.js', 'List.js', 'Overview.js', 'Menu.js'];

const SCREENS_DIR = 'services/web/src/Screens';

async function generateScreens(options) {
  const { pluralUpper } = options;

  const screensDir = await assertPath(SCREENS_DIR);
  await mkdir(screensDir, pluralUpper);

  await Promise.all(
    FILES.map(async (file) => {
      let source = await readSourceFile(screensDir, 'Shops', file);
      source = replacePrimary(source, options);
      source = replaceReferenceImports(source, options);
      source = replaceReferenceRoutes(source, options);
      source = replaceReferenceMenus(source, options);
      source = replaceOverviewFields(source, options);
      source = replaceFilters(source, options);
      await writeLocalFile(source, screensDir, pluralUpper, file);
    })
  );

  await generateReferenceScreens(screensDir, options);
  await patchAppEntrypoint(options);
  await patchIndex(screensDir, pluralUpper);

  console.log(yellow('Screens generated!'));
}

function replaceReferenceImports(source, options) {
  const imports = options.references
    .map(({ pluralUpper }) => {
      return `import ${pluralUpper} from './${pluralUpper}';`;
    })
    .join('\n');
  return replaceBlock(source, imports, 'main-imports');
}

function replaceOverviewFields(source) {
  // TODO: Just remove for now
  return replaceBlock(source, '', 'overview');
}

function replaceReferenceRoutes(source, options) {
  const imports = options.references
    .map(({ camelUpper, pluralLower }) => {
      return block`
      <Route
        exact
        path="/${options.pluralLower}/:id/${pluralLower}"
        render={(props) => (
          <${camelUpper}
            id={id}
            {...props}
            {...this.state}
            onSave={this.fetch${camelUpper}}
          />
        )}
      />
    `;
    })
    .join('\n');
  return replaceBlock(source, imports, 'routes');
}

function replaceReferenceMenus(source, options) {
  const imports = options.references
    .map(({ pluralLower, pluralUpper }) => {
      return block`
      <Menu.Item
        name="${pluralUpper}"
        to={\`/${options.pluralLower}/\${id}/${pluralLower}\`}
        as={NavLink}
        exact
      />
    `;
    })
    .join('\n');
  return replaceBlock(source, imports, 'menus');
}

async function generateReferenceScreens(screensDir, options) {
  if (options.references.length) {
    const refSource = await readSourceFile(SCREENS_DIR, 'Shops/Products.js');
    await Promise.all(
      options.references.map(async (ref) => {
        let source = refSource;
        source = replacePrimary(source, options);
        source = replaceSecondary(source, ref);
        await writeLocalFile(
          source,
          screensDir,
          options.pluralUpper,
          `${ref.pluralUpper}.js`
        );
      })
    );
  }
}

module.exports = {
  generateScreens,
};

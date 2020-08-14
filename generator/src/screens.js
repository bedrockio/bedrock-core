const { yellow } = require('kleur');
const { startCase } = require('lodash');
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

  // Do this sequentially to ensure order
  for (let file of FILES) {
    let source = await readSourceFile(screensDir, 'Shops', file);
    source = replacePrimary(source, options);
    source = replaceReferenceImports(source, options);
    source = replaceReferenceRoutes(source, options);
    source = replaceReferenceMenus(source, options);
    source = replaceOverview(source, options);
    source = replaceHeaderCells(source, options);
    source = replaceConstants(source, options);
    source = replaceBodyCells(source, options);
    source = replaceFilters(source, options);
    await writeLocalFile(source, screensDir, pluralUpper, file);
  }

  await generateReferenceScreens(screensDir, options);
  await patchAppEntrypoint(options);
  await patchIndex(screensDir, pluralUpper);

  console.log(yellow('Screens generated!'));
}

function replaceReferenceImports(source, options) {
  const imports = options.secondaryReferences
    .map(({ pluralUpper }) => {
      return `import ${pluralUpper} from './${pluralUpper}';`;
    })
    .join('\n');
  return replaceBlock(source, imports, 'imports');
}

function replaceOverview(source, options) {
  const { camelLower } = options;
  const summaryFields = getSummaryFields(options);
  const jsx = summaryFields.map((field, i) => {
    const { name } = field;
    const tag = i === 0 ? 'h1' : 'h3';
    if (name === 'image') {
      return block`
        <Image key={${camelLower}.image.id} src={urlForUpload(${camelLower}.image)} />
      `;
    } else {
      return block`
        <Header as="${tag}">{${camelLower}.${name}}</Header>
      `;
    }
  }).join('\n');

  return replaceBlock(source, jsx, 'overview');
}

function replaceHeaderCells(source, options) {
  const summaryFields = getSummaryFields(options);
  const jsx = summaryFields.map((field) => {
    const { name, type } = field;
    const title = startCase(name);
    if (type === 'String') {
      return block`
        <Table.HeaderCell
          sorted={getSorted('${name}')}
          onClick={() => setSort('${name}')}>
          ${title}
        </Table.HeaderCell>
      `;
    } else {
      return block`
        <Table.HeaderCell>
         ${title}
        </Table.HeaderCell>
      `;
    }
  }).join('\n');

  return replaceBlock(source, jsx, 'header-cells');
}

function replaceBodyCells(source, options, resource) {

  let link = false;
  if (!resource) {
    resource = options;
    link = true;
  }

  const { camelLower, pluralLower } = resource;

  const summaryFields = getSummaryFields(options);
  const jsx = summaryFields.map((field, i) => {
    const { name } = field;

    let inner = name === 'image'
      ? `<Image src={urlForUpload(${camelLower}.${name}, true)} />`
      : `{${camelLower}.${name}}`;

    if (i === 0 && link) {
      inner = `
          <Link to={\`/${pluralLower}/\${${camelLower}.id}\`}>
            ${inner}
          </Link>
      `;
    }
    return block`
        <Table.Cell>
          ${inner}
        </Table.Cell>
    `;
  }).join('\n');

  return replaceBlock(source, jsx, 'body-cells');
}

function replaceConstants(source, options) {
  // Just remove for now.
  return replaceBlock(source, '', 'constants');
}

function getSummaryFields(options) {
  // Try to take the "name" and "image" fields if they exist.
  return options.schema.filter((field) => {
    const { name } = field;
    return name === 'name' || name === 'image';
  });
}

function replaceReferenceRoutes(source, options) {
  const imports = options.secondaryReferences
    .map(({ camelUpper, pluralLower, pluralUpper }) => {
      return block`
      <Route
        exact
        path="/${options.pluralLower}/:id/${pluralLower}"
        render={(props) => (
          <${pluralUpper}
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
  const imports = options.secondaryReferences
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
  if (options.secondaryReferences.length) {
    const refSource = await readSourceFile(screensDir, 'Shops/Products.js');
    await Promise.all(
      options.secondaryReferences.map(async (ref) => {
        let source = refSource;
        source = replacePrimary(source, options);
        source = replaceHeaderCells(source, options, ref);
        source = replaceBodyCells(source, options, ref);
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

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

  const screensDir = await getScreensDir(options);

  // Do this sequentially to ensure order
  for (let file of FILES) {
    let source = await readSourceFile(screensDir, 'Shops', file);
    source = replacePrimary(source, options);
    source = replaceSubScreenImports(source, options);
    source = replaceSubScreenRoutes(source, options);
    source = replaceSubScreenMenus(source, options);
    source = replaceOverviewFields(source, options);
    source = replaceOverviewRows(source, options);
    source = replaceOverviewImports(source, options);
    source = replaceListHeaderCells(source, options);
    source = replaceListBodyCells(source, options);
    source = replaceListImports(source, options);
    source = replaceFilters(source, options);
    await writeLocalFile(source, screensDir, pluralUpper, file);
  }

  // Attempt to patch app entrypoint
  await patchAppEntrypoint(options);
  await patchIndex(screensDir, pluralUpper);

  console.log(yellow('Screens generated!'));
}

async function generateSubScreens(options) {
  const screensDir = await getScreensDir(options);
  const source = await readSourceFile(screensDir, 'Shops/Products.js');
  await generateSubScreensFor(screensDir, source, [options], options.subScreens);
  await generateSubScreensFor(screensDir, source, options.externalSubScreens, [options]);
}

async function generateSubScreensFor(screensDir, source, primary, secondary) {
  if (primary.length && secondary.length) {
    await Promise.all(
      primary.map(async (primary) => {
        return Promise.all(
          secondary.map(async (secondary) => {
            source = replacePrimary(source, primary);
            source = replaceSecondary(source, secondary);
            source = replaceListHeaderCells(source, secondary);
            source = replaceListBodyCells(source, secondary, primary);
            await writeLocalFile(
              source,
              screensDir,
              primary.pluralUpper,
              `${secondary.pluralUpper}.js`
            );
          })
        );
      })
    );
  }
}

async function getScreensDir(options) {
  const { pluralUpper } = options;
  const screensDir = await assertPath(SCREENS_DIR);
  await mkdir(screensDir, pluralUpper);
  return screensDir;
}

function replaceSubScreenImports(source, options) {
  const { subScreens } = options;
  const imports = subScreens.map((resource) => {
    const { pluralUpper } = resource;
    return `import ${pluralUpper} from './${pluralUpper}';`;
  }).join('\n');

  return replaceBlock(source, imports, 'imports');
}

function replaceSubScreenRoutes(source, options) {
  const imports = options.subScreens
    .map(({ pluralLower, pluralUpper }) => {
      return block`
      <Route
        exact
        path="/${options.pluralLower}/:id/${pluralLower}"
        render={(props) => (
          <${pluralUpper}
            {...props}
            {...this.state}
            onSave={this.fetch${options.camelUpper}}
          />
        )}
      />
    `;
    })
    .join('\n');
  return replaceBlock(source, imports, 'routes');
}

function replaceSubScreenMenus(source, options) {
  const imports = options.subScreens
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

function replaceOverviewFields(source, options) {
  const { camelLower } = options;
  const summaryFields = getSummaryFields(options);
  const jsx = summaryFields.map((field, i) => {
    const { name } = field;
    const tag = i === 0 ? 'h1' : 'h3';
    if (name === 'image') {
      return block`
        {${camelLower}.image && (
          <Image key={${camelLower}.image.id} src={urlForUpload(${camelLower}.image)} />
        )}
      `;
    } else if (name === 'images') {
      return block`
        <Image.Group size="large">
          {${camelLower}.images.map((image) => (
            <Image key={image.id} src={urlForUpload(image)} />
          ))}
        </Image.Group>
      `;
    } else {
      return block`
        <Header as="${tag}">{${camelLower}.${name}}</Header>
      `;
    }
  }).join('\n');

  return replaceBlock(source, jsx, 'overview-fields');
}

function replaceOverviewRows(source, options) {
  const summaryFields = getSummaryFields(options);
  const otherFields = options.schema.filter((field) => {
    return !summaryFields.includes(field);
  });

  const rows = otherFields.map((field) => {
    const { name, type } = field;
    if (!type.match(/ObjectId/)) {
      return block`
        <Table.Row>
          <Table.Cell>${startCase(name)}</Table.Cell>
          <Table.Cell>
            {${getOverviewCellValue(`${options.camelLower}.${name}`, field)}}
          </Table.Cell>
        </Table.Row>
      `;
    }
  }).filter((r) => r);

  source = replaceBlock(source, rows.join('\n'), 'overview-rows');

  return source;
}

function getOverviewCellValue(token, field) {
  switch (field.type) {
    case 'UploadArray':
    case 'StringArray':
    case 'ObjectIdArray':
      return `${token}.join(', ') || 'None'`;
    case 'Boolean':
      return `${token} ? 'Yes' : 'No'`;
    case 'Date':
      if (field.time) {
        return `${token} ? formatDateTime(${token}) : 'None'`;
      } else {
        return `${token} ? formatDate(${token}) : 'None'`;
      }
    default:
      return `${token} || 'None'`;
  }
}

function replaceOverviewImports(source, options) {
  const { schema } = options;

  const imports = [];

  const dateMethods = ['formatDateTime'];

  if (schema.some((field) => field.type === 'Date' && !field.time)) {
    dateMethods.push('formatDate');
  }

  imports.push(`import { ${dateMethods.join(', ')} } from 'utils/date';`);

  if (schema.some((field) => field.type.match(/Upload/))) {
    imports.push("import { urlForUpload } from 'utils/uploads';");
  }

  source = replaceBlock(source, imports.join('\n'), 'overview-imports');

  return source;
}

function replaceListHeaderCells(source, options) {
  const summaryFields = getSummaryFields(options);
  const jsx = summaryFields.map((field) => {
    const { name, type } = field;
    if (type === 'String') {
      return block`
        <Table.HeaderCell
          sorted={getSorted('${name}')}
          onClick={() => setSort('${name}')}>
          ${startCase(name)}
        </Table.HeaderCell>
      `;
    } else {
      return block`
        <Table.HeaderCell>
         ${name === 'id' ? 'ID' : startCase(name)}
        </Table.HeaderCell>
      `;
    }
  }).join('\n');

  return replaceBlock(source, jsx, 'list-header-cells');
}

function replaceListBodyCells(source, options, resource) {

  let link = false;
  if (!resource) {
    resource = options;
    link = true;
  }

  const { camelLower, pluralLower } = resource;

  const summaryFields = getSummaryFields(options);
  const jsx = summaryFields.map((field, i) => {
    const { name } = field;

    let inner;
    if (name === 'image') {
      inner = `
        {${camelLower}.${name} && (
          <Image src={urlForUpload(${camelLower}.${name}, true)} />
        )}
      `;
    } else {
      inner = `{${camelLower}.${name}}`;
    }

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

  return replaceBlock(source, jsx, 'list-body-cells');
}

function replaceListImports(source, options) {
  const { schema } = options;

  const imports = [];

  if (schema.some((field) => field.type.match(/Upload/))) {
    imports.push("import { urlForUpload } from 'utils/uploads';");
  }

  if (schema.some(({ name }) => name === 'image' || name === 'images')) {
    imports.push("import { Image } from 'semantic-ui-react';");
  }

  source = replaceBlock(source, imports.join('\n'), 'list-imports');

  return source;
}

function getSummaryFields(options) {
  // Try to take the "name" and "image" fields if they exist.
  const summaryFields = (options.schema || []).filter((field) => {
    const { name } = field;
    return name === 'name' || name === 'image';
  });
  if (!summaryFields.length) {
    summaryFields.push({
      name: 'id',
      type: 'id',
    });
  }
  return summaryFields;
}

module.exports = {
  generateScreens,
  generateSubScreens,
};

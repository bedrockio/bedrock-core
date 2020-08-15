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
    source = replaceOverviewFields(source, options);
    source = replaceOverviewRows(source, options);
    source = replaceOverviewImports(source, options);
    source = replaceListHeaderCells(source, options);
    source = replaceListBodyCells(source, options);
    source = replaceConstants(source, options);
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

function replaceOverviewFields(source, options) {
  const { camelLower } = options;
  const summaryFields = getOverviewMainFields(options);
  const jsx = summaryFields.map((field, i) => {
    const { name } = field;
    const tag = i === 0 ? 'h1' : 'h3';
    if (name === 'image') {
      return block`
        <Image key={${camelLower}.image.id} src={urlForUpload(${camelLower}.image)} />
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
  const summaryFields = getOverviewMainFields(options);
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

  if (rows.length) {
    source = replaceBlock(source, rows.join('\n'), 'overview-rows');
  }

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

  if (imports.length) {
    source = replaceBlock(source, imports.join('\n'), 'overview-imports');
  }

  return source;
}

function replaceListHeaderCells(source, options) {
  const summaryFields = getListMainFields(options);
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
         ${startCase(name)}
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

  const summaryFields = getListMainFields(options);
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

  return replaceBlock(source, jsx, 'list-body-cells');
}

function replaceConstants(source) {
  // Just remove for now.
  return replaceBlock(source, '', 'constants');
}

function getOverviewMainFields(options) {
  // Try to take the "name" and "image" or "images" fields if they exist.
  return options.schema.filter((field) => {
    const { name } = field;
    return name === 'name' || name === 'image' || name === 'images';
  });
}

function getListMainFields(options) {
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
        source = replaceListHeaderCells(source, options, ref);
        source = replaceListBodyCells(source, options, ref);
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

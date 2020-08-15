const { assertPath, block } = require('./util');
const { replaceSchema } = require('./joi');
const { yellow } = require('kleur');

const {
  readSourceFile,
  writeLocalFile,
  replaceBlock,
  replacePrimary,
} = require('./source');

const ROUTES_DIR = 'services/api/src/v1';

async function generateRoutes(options) {
  const { pluralLower } = options;

  const routesDir = await assertPath(ROUTES_DIR);

  const searchSchema = getSearchSchema(options.schema);

  let source = await readSourceFile(routesDir, 'shops.js');
  source = replacePrimary(source, options);
  source = replaceSchema(source, options.schema, 'create');
  source = replaceSchema(source, options.schema, 'update');
  source = replaceSchema(source, searchSchema, 'search');
  source = replaceSearchQuery(source, searchSchema);

  await writeLocalFile(source, routesDir, `${pluralLower}.js`);
  await patchRoutesEntrypoint(routesDir, options);

  console.log(yellow('Routes generated!'));
}

const REQUIRE_REG = /^const \w+ = require\('.+'\);$/gm;
const ROUTES_REG  = /^router.use\(.+\);$/gm;

async function patchRoutesEntrypoint(routesDir, options) {
  const { pluralLower } = options;
  let source = await readSourceFile(routesDir, 'index.js');

  const requires = `const ${pluralLower} = require('./${pluralLower}');`;
  const routes = `router.use('/${pluralLower}', ${pluralLower}.routes());`;

  source = injectByReg(source, requires, REQUIRE_REG);
  source = injectByReg(source, routes, ROUTES_REG);

  await writeLocalFile(source, routesDir, 'index.js');
}

function injectByReg(source, replace, reg) {
  if (!source.includes(replace)) {
    const match = source.match(reg);
    if (match) {
      const last = match[match.length - 1];
      const index = source.indexOf(last) + last.length;

      let src = '';
      src += source.slice(0, index);
      src += '\n';
      src += replace;
      src += source.slice(index);
      source = src;
    }
  }
  return source;
}

function getSearchSchema(schema) {
  return schema.filter((field) => {
    return !field.private;
  });
}

function replaceSearchQuery(source, schema) {

  const vars = block`
    const { ${schema.map((f) => f.name).join(', ')} } = ctx.request.body;
  `;

  const queries = schema.map((field) => {
    const { type, name } = field;
    // TODO: for now assume that only "name"
    // requires partial text search
    if (name === 'name') {
      return block`
        if (${name}) {
          query.${name} = {
            $regex: ${name},
            $options: 'i',
          };
        }
      `;
    } else if (type.match(/Array/)) {
      return block`
        if (${name}) {
          query.${name} = { $in: ${name} };
        }
      `;
    } else {
      return block`
        if (${name}) {
          query.${name} = ${name};
        }
      `;
    }
  }).join('\n');
  source = replaceBlock(source, vars, 'vars');
  source = replaceBlock(source, queries, 'queries');
  return source;
}

module.exports = {
  generateRoutes,
};

const { assertPath, block } = require('./util');
const { kebabCase } = require('lodash');
const {
  readSourceFile,
  writeLocalFile,
  replaceBlock,
  replacePrimary,
} = require('./source');


const TESTS_DIR = 'services/api/src/v1/__tests__';

const LOREM = block`
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`;

async function generateTests(options) {
  const { pluralLower } = options;
  const testsDir = await assertPath(TESTS_DIR);
  let source = await readSourceFile(testsDir, 'shops.js');
  source = replacePrimary(source, options);
  source = replaceBlock(source, '', 'vars');
  source = replaceTestRequires(source, options);
  source = replaceTestSearch(source, options);
  source = replaceTestGet(source, options);
  source = replaceTestPost(source, options);
  source = replaceTestPatch(source, options);
  source = replaceTestDelete(source, options);
  await writeLocalFile(source, testsDir, `${pluralLower}.js`);
}

function replaceTestSearch(source, options) {
  const { camelLower, camelUpper, pluralLower } = options;
  const kebab = kebabCase(pluralLower);
  const body = block`
    const user = await createUser();

    const ${camelLower}1 = await ${camelUpper}.create({
      ${getRequiredFixtures(options, 3)}
    });

    const ${camelLower}2 = await ${camelUpper}.create({
      ${getRequiredFixtures(options, 3)}
    });

    const response = await request('POST', '/1/${kebab}/search', {}, { user });

    expect(response.status).toBe(200);
    const body = response.body;
    expect(body.meta.total).toBe(2);

    ${getRequiredExpects(options, 'body.data[0]', `${camelLower}2`)}

    ${getRequiredExpects(options, 'body.data[1]', `${camelLower}1`)}
  `;
  return replaceBlock(source, body, 'test-search');
}

function replaceTestGet(source, options) {
  const { camelLower, camelUpper, pluralLower } = options;
  const kebab = kebabCase(pluralLower);
  const body = block`
    const user = await createUser();
    const ${camelLower} = await ${camelUpper}.create({
      ${getRequiredFixtures(options, 3)}
    });
    const response = await request('GET', \`/1/${kebab}/\${${camelLower}.id}\`, {}, { user });
    expect(response.status).toBe(200);
    ${getRequiredExpects(options, 'response.body.data', camelLower)}
  `;
  return replaceBlock(source, body, 'test-get');
}

function replaceTestPost(source, options) {
  const kebab = kebabCase(options.pluralLower);
  const body = block`
    const user = await createUser();
    const response = await request(
      'POST',
      '/1/${kebab}',
      {
        ${getRequiredFixtures(options, 4)}
      },
      { user }
    );
    const data = response.body.data;
    expect(response.status).toBe(200);
    ${getRequiredExpects(options, 'data')}
  `;
  return replaceBlock(source, body, 'test-post');
}

function replaceTestPatch(source, options) {
  const { camelLower, camelUpper, pluralLower } = options;
  const kebab = kebabCase(pluralLower);
  const body = block`
    const user = await createUser();
    let ${camelLower} = await ${camelUpper}.create({
      ${getRequiredFixtures(options, 3, true)}
    });
    const response = await request('PATCH', \`/1/${kebab}/\$\{${camelLower}.id\}\`, {
    }, { user });
    expect(response.status).toBe(200);
    ${camelLower} = await ${camelUpper}.findById(${camelLower}.id);
    ${getRequiredExpects(options, camelLower, null, true)}
  `;
  return replaceBlock(source, body, 'test-patch');
}

function replaceTestDelete(source, options) {
  const { camelLower, camelUpper, pluralLower } = options;
  const kebab = kebabCase(pluralLower);
  const body = block`
    const user = await createUser();
    let ${camelLower} = await ${camelUpper}.create({
      ${getRequiredFixtures(options, 3)}
    });
    const response = await request('DELETE', \`/1/${kebab}/\${${camelLower}.id\}\`, {}, { user });
    expect(response.status).toBe(204);
    ${camelLower} = await ${camelUpper}.findById(${camelLower}.id);
    expect(${camelLower}.deletedAt).toBeDefined();
  `;
  return replaceBlock(source, body, 'test-delete');
}

function getRequiredFixtures(options, tab, alternate) {
  return options.schema
    .filter((field) => {
      return field.required;
    })
    .map((field) => {
      const { name, type } = field;
      let value;
      if (type.match(/Array/)) {
        value = `[${getFixtureValue(field, alternate)}]`;
      } else {
        value = getFixtureValue(field, alternate);
      }
      return `${name}: ${value},`;
    })
    .join('\n' + '  '.repeat(tab));
}

function getRequiredExpects(options, expect, assert, alternate) {
  return options.schema
    .filter((field) => {
      // Reference field may or may not be populated, so hard to
      // choose what to expect on, so just ignore it here.
      return field.required && field.schemaType !== 'ObjectId';
    })
    .map((field) => {
      const { name, type } = field;
      let method;
      let expected;
      if (assert) {
        expected = `${assert}.${name}`;
      }
      if (type.match(/Array/)) {
        method = 'toEqual';
        if (!expected) {
          expected = `[${getFixtureValue(field, alternate)}]`;
        }
      } else {
        method = 'toBe';
        if (!expected) {
          expected = getFixtureValue(field, alternate);
        }
      }
      return `expect(${expect}.${name}).${method}(${expected});`;
    })
    .join('\n    ');
}

function getFixtureValue(field, alternate = false) {
  const { name, schemaType } = field;
  if (schemaType === 'String') {
    if (field.enum) {
      return `"${field.enum[0]}"`;
    } else if (field.minlength || field.maxlength) {
      const max = Math.min(field.maxlength, Math.max(field.minlength, 10));
      return `"${LOREM.slice(0, max)}"`;
    } else {
      const fake = alternate ? 'other fake' : 'fake';
      return `"${fake} ${name}"`;
    }
  } else if (schemaType === 'Number') {
    let min = field.min || 1;
    let max = field.max || 10;
    return Math.floor((min + max) / (alternate ? 3 : 2));
  } else if (schemaType === 'Boolean') {
    return alternate ? 'false' : 'true';
  } else if (schemaType === 'Date') {
    const str = alternate ? '2020-01-01T00:00:00' : '2020-01-02T00:00:00';
    return `"${str}"`;
  } else if (schemaType === 'ObjectId') {
    return 'mongoose.Types.ObjectId()';
  }
}

function replaceTestRequires(source, options) {
  const hasRequiredReference = options.schema.some((field) => {
    return field.required && field.schemaType === 'ObjectId';
  });

  const requires = [];
  if (hasRequiredReference) {
    requires.push("const mongoose = require('mongoose');");
  }
  return replaceBlock(source, requires.join('\n'), 'requires');
}

module.exports = {
  generateTests,
};

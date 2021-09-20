# Fixture Importer

As projects grow in complexity, having good fixture data becomes increasingly important, however manually managing that data also becomes difficult. This module helps to alleviate these issues by providing a simple, consistent way to import fixtures.

## Concepts

- [File Structure](#file-structure)
- [Fixture Modules](#fixture-modules)
- [Transforms](#transforms)
  - [File Transforms](#file-transforms)
  - [Content Transforms](#content-transforms)
  - [Custom Transforms](#custom-transforms)
  - [Default Transforms](#default-transforms)
- [Object References](#object-references)
- [Circular Dependencies](#circular-dependencies)
- [Generated Fixtures](#generated-fixtures)
- [Testing](#testing)
- [Debugging](#debugging)
- [Notes](#notes)

## File Structure

Fixtures are referenced in a consistent, flat file structure. Inside the `fixtures` directory, base directories correspond to the pluralized model names:

```shell
fixtures/shops
fixtures/users
fixtures/products
```

Within each base directory, individual fixtures may be any module that node `require` can resolve:

```shell
fixtures/shops/demo/index.json
fixtures/shops/demo/index.js
fixtures/shops/demo.json
fixtures/shops/demo.js
```

Only base directories corresponding to model names will be resolved, so common or utility files can be safely placed here:

```shell
fixtures/shops/demo.json
fixtures/files/logo.png
fixtures/utils/other.js
```

## Fixture Modules

The content of each resolved fixture module will ultimately be imported to the database. For simple data this can be pure JSON:

```json
{
  "name": "Demo",
  "description": "An example shop",
  "category": "jewelry"
}
```

However any resolvable module will be imported, so Javascript features can also be used:

```js
const categories = require('../../categores');

module.exports = {
  name: 'Demo',
  description: `
  
    A longer description
    with multiple lines.

  `,
  categories,
};
```

Additionally, modules that export a function will be resolved asynchronously, opening up more flexibility:

```js
const fetch = require('node-fetch');
const url = 'https://jsonplaceholder.typicode.com/users';
module.exports = async () => {
  return await fetch(url);
};
```

## Transforms

Certain types of fields will be transformed when importing.

### File Transforms

Inside fixtures, fields ending in media or known file types will be converted to `Upload` objects and attached:

```json
{
  "name": "Demo",
  "image": "image.jpg",
  "file": "file.pdf"
}
```

### Content Transforms

Content based files such as text, and markdown will be loaded and inlined directly into the data:

```json
{
  "name": "Demo",
  "description": "description.md",
  "intro": "intro.txt"
}
```

becomes:

```json
{
  "name": "Demo",
  "description": "Hi! I'm the file content!",
  "intro": "intro.txt"
}
```

Additionally, links and images inside markdown and HTML files will be further inlined, converted to `Upload` objects, and replaced with a link to the file:

```md
## Title

Some descriptive text, an ![image](image.jpg),
as well as a [link to a pdf](document.pdf).
```

```md
## Title

Some descriptive text, an ![image](http://api/1/uploads/image.jpg),
as well as a [link to a pdf](http://api/1/uploads/document.pdf).
```

### Custom Transforms

Custom transforms allow a specific syntax to have special behavior. Currently there are two kinds: environment variables and refs.

```json
{
  // Will pull from .env
  "email": "<env:ADMIN_EMAIL>"
}
```

```json
{
  // Will import the ObjectId of another fixture
  // This is useful in freeform fields where the
  // type cannot be inferred from the schema.
  "object": "<ref:users/john>"
}
```

The `CUSTOM_TRANSFORMS` object in `./const` allows you to define other transforms making them extensible.

### Default Transforms

Additionally there are a few built-in transforms for `User` fixtures that allow shorter syntax.

- `name` will be expanded to `firstName` and `lastName`
- `email` will be inferred from the `firstName` of the user and the admin email, for example `john@bedrock.foundation`.
- `role` will be expanded into a `roles` object based on `src/roles.json`. Organization based roles will use the default organization.
- `password` will default to `ADMIN_PASSWORD` in the env if not defined.

The `DEFAULT_TRANSFORMS` object in `./const` allows you to define other defaults.

## Object References

One major difficulty with wrangling fixtures is building complex inderdependent relationships. Fixture importer makes this easy by allowing you to reference other fixtures in the graph. For example:

```json
{
  "name": "Product 1",
  "shop": "shop-2"
}
```

The `shop` field here will be inferred from the schema and resolved to the `ObjectId` of the fixture imported from `fixtures/shops/shop-2`.

## Circular Dependencies

Circular dependencies are often a sign of a bad data structure, but not always. For example `user.profileImage` may reference an image object whose `owner` field is the user. When importing, circular dependencies will be detected and resolve themselves so that importing can be completed. In such cases a warning will be output to indicate a potential issue, however all data will be imported.

## Generated Fixtures

In many cases having a single module for each fixture can be too much overhead. In these cases fixtures can be generated using a single entrypoint in the base directory:

```js
// shops/index.js

const { kebabCase } = require('lodash');
const names = ['Flower Shop', 'Department Store', 'Supermarket'];

module.exports = names.map((name) => {
  return {
    name,
    slug: kebabCase(name),
  };
});
```

In this example, the resulting objects will all be imported as `Shop` fixtures. Note that these modules should return _plain objects_. They should be thought of as identical to individual JSON files, just procedurally generated. This is a powerful feature that allows generated fixtures to reference and be referenced by other fixtures.

Additionally, returning an array here will result in auto-generated fixture names. For example the first import will be called `shop-1`. In some cases it may be preferable to choose the fixture name to allow other fixtures to reference them. In these cases simply export an object instead:

```js
// shops/index.js

const { kebabCase } = require('lodash');
const names = ['Flower Shop', 'Department Store', 'Supermarket'];

const fixtures = {};
for (let name of names) {
  const slug = kebabCase(name);
  fixtures[slug] = { name, slug };
}

module.exports = fixtures;
```

Generated fixture modules are also passed two helper functions when they return a function as a default export. These can be helpful to generate fixtures.

The first is `generateFixtureId` which works the same as when exporting arrays by incrementing a counter.

The second is `loadFixtureModules` which allows you to reference other fixture modules without importing them. This can be useful for complex cases:

```js
module.exports = async ({ loadFixtureModules, generateFixtureId }) => {
  const posts = loadFixtureModules('posts');
  const fixtures = {};

  function exportComments(comments) {
    for (let comment of comments) {
      fixtures[generateFixtureId()] = comment;
      exportComments(comment.comments);
    }
  }

  for (let post of posts) {
    exportComments(post.comments);
  }

  return fixtures;
};
```

In this example recursion allows comments to be nested inline along with the posts for better context.

Notes:

- Mongoose by default does not save unknown fields that are not defined in the schema. This allows a `comments` field to exist on posts in the fixtures without being imported.
- Using `loadFixtureModules` will result in an object that is either built by reading subdirectories (the default) or the result of another generated fixture module.
- Generated fixture modules will supercede any other fixtures within the directory. In other words if a `shops/index.js` file exists, no other fixtures in the `shops` directory will be loaded. However you can of course still `require` and export them. This behavior can be thought of as a gateway allowing you to aggregate, modify, and export customized fixtures.

## Testing

It is often useful to run tests against fixture data. To help facilitate this, fixtures can be imported and accessed easily.

After running the imports, fixtures can be accessed both as nested objects and though the full path, allowing easy referencing and iterating over the fixtures.

```js
const { importFixtures } = require('utils/fixtures');

test('Test against fixtures', async () => {
  const data = await importFixtures();

  expect(data['shops']['demo']).toEqual({ ... });
  expect(data['shops/demo']).toEqual({ ... });

})
```

Additionally, `importFixtures` can also be used to import only a subset of the fixtures:

```js
const { importFixtures } = require('utils/fixtures');

test('Test against a single shop', async () => {
  const shop = await importFixtures('shops/demo');
  expect(shop).toEqual({ ... });
})

test('Test against all shops', async () => {
  const shopsById = await importFixtures('shops');
  // ...
})
```

Note that all fixture data is cached, which has implications for testing. For example calling `Users.deleteMany({})` after a test will remove all documents from the database, however running `importFixtures` a second time will return the memoized objects with nothing imported to the db.

There are advantages to this, speed being the main one. An ideal testing scenario will assume a database loaded with base fixtures at the outset and only clean up the specific objects that test has created. However there may be scenarios where this is difficult so a `resetFixtures` function is also exported by this module. Running it will clear all caches and another call to `importFixtures` will re-import the data, however this may take time!

Note that although calling `importFixtures('shops/demo')` will only import a subset of the fixtures, this may import a lot of data depending on the dependency chain.

## Debugging

Running the script with `LOG_LEVEL=debug` will output detailed information that may be useful for debugging.

## Notes

Note that `users/admin` and `oraganizations/bedrock` are special fixtures required to bootstrap the data. These are defined in `./const` and can be moved.

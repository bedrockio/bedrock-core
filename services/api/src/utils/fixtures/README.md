# Importing Fixtures

As projects grow in complexity, having good fixture data becomes increasingly important, however manually managing that data also becomes difficult. This module helps to alleviate these issues by providing a simple, consistent way to import fixtures.

## Concepts

- [Usage](#usage)
- [File Structure](#file-structure)
- [Fixture Modules](#fixture-modules)
- [Fixture Ids](#fixture-ids)
- [Transforms](#transforms)
  - [File Uploads](#file-uploads)
  - [File Inlining](#file-inlining)
  - [Model Transforms](#model-transforms)
  - [Custom Transforms](#custom-transforms)
- [Object References](#object-references)
- [Circular References](#circular-references)
- [Generated Fixtures](#generated-fixtures)
- [Testing](#testing)
- [Debugging](#debugging)
- [Notes](#notes)

## Usage

Package scripts are the main way of interacting with fixtures:

- `yarn start` - When the development server starts, fixtures will be loaded if the database is empty.
- `yarn fixtures:reload` - Drops the database and reloads all fixtures.
- `yarn fixtures:load` - Loads fixtures if the database is empty. Fixtures are not auto-loaded in non-development environments as multiple pods starting up at the same time can cause data duplication, so instead this script is used to provision the data once through the CLI pod.

Additionally, this module exports a function `importFixtures` that can manually import fixtures. This is mostly provided for [testing](#testing).

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
fixtures/utils.js
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

module.exports = async () => {
  return await fetch('https://jsonplaceholder.typicode.com/users/1');
};
```

## Fixture Ids

When referencing fixtures, an id is used that corresponds to its relative file path. For example `shops/demo` refers to the `demo` fixture for the `Shop` model. The fixture name (the part after the slash) is either derived from the file path or set manually in the case of [generated fixtures](#generated-fixtures).

Inside the fixtures themselves, typically only the name is needed as the base directory is [inferred from the schema](#object-references). However there are times when the full fixture id is needed to reference a fixture, for example when [testing](#testing).

## Transforms

Certain fields will be transformed when importing.

### File Uploads

Files can be referenced and transformed inside fixtures. In the example below, the referenced files will be transformed to `Upload` objects when the schema type for that field is an `ObjectId`.

```json
{
  "name": "Demo",
  "image": "image.jpg",
  "file": "file.pdf"
}
```

Allowed file types are `(jpg|png|svg|gif|webp|mp4|md|txt|html|pdf|csv)`.

### File Inlining

To load the file and directly set the content on the document, change the schema type to `String`:

```json
{
  "name": "Demo",
  "description": "description.md",
  "intro": "intro.txt"
}
```

```json
{
  "name": "Demo",
  "description": "I'm the content of description.md!",
  "intro": "I'm the content of intro.txt!"
}
```

When inlining content, links and images inside markdown and HTML files will be further inlined, converted to `Upload` objects, and replaced with a link to the file:

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

Finally, fields with a schema type `Buffer` will directly set binary data on the document:

```js
{
  // Will be attached as binary data
  // when the schema type is "Buffer".
  "image": "image.jpg",
}
```

### Model Transforms

Other transforms can be defined to target specific model contexts. Bedrock comes with transforms that provide some defaults for the `User` model:

- `name` will be expanded to `firstName` and `lastName`.
- `email` will be generated if not specified. It will default to the `firstName` of the user and the domain of the admin email, for example `jack@bedrock.foundation`.
- `role` will be expanded into a `roles` object based on keys defined in `src/roles.json`. Organization based roles will use the [default organization](#notes).
- `password` will default to `ADMIN_PASSWORD` in `.env`.

These can be configured and extended in `./const`.

### Custom Transforms

Custom transforms are a specific syntax to allow special behavior in all fixtures. Currently there are two kinds: environment variables and refs.

```js
{
  // Will pull from .env
  "email": "<env:ADMIN_EMAIL>"
}
```

```js
{
  // Will import the ObjectId of another fixture
  // This is useful in freeform fields where the
  // type cannot be inferred from the schema.
  "object": "<ref:users/jack>"
}
```

Custom transforms can be configured and extended in `./const`.

## Object References

One major difficulty with wrangling fixtures is building complex inderdependent relationships. The fixture importer makes this easy by allowing you to reference other fixtures in the graph. For example:

```json
{
  "name": "Product 1",
  "shop": "demo"
}
```

Here, the `shop` field of the `Product` schema is known to be an `ObjectId` referencing a `Shop`, so the importer will load the fixture `shop/demo` and attach its `ObjectId` to this field.

## Circular References

Circular references are often a sign of a bad data structure, but not always. For example `user.profileImage` may reference an image object whose `owner` field is the user. When importing, circular dependencies will be detected and resolved automatically so that importing can complete. In such cases a warning will be output to indicate a potential issue, however all data will be imported.

## Generated Fixtures

In many cases having a single module for each fixture can be too much overhead. In these cases fixtures can be generated using a single entrypoint in the base directory:

```js
// fixtures/shops/index.js

const { kebabCase } = require('lodash');
const names = ['Flower Shop', 'Department Store', 'Supermarket'];

module.exports = names.map((name) => {
  return {
    name,
    slug: kebabCase(name),
  };
});
```

In this example, the resulting objects will all be imported as `Shop` fixtures. Note that these modules should return plain objects. They should be thought of as identical to individual JSON files, just procedurally generated. This allows generated fixtures to reference and be referenced by other fixtures.

Returning an array here will result in auto-generated fixture names. For example, the first export will be called `shop-1`. To manually choose the fixture name, export an object instead:

```js
// shops/index.js

const { kebabCase } = require('lodash');
const names = ['Flower Shop', 'Department Store', 'Supermarket'];
const fixtures = {};

for (let name of names) {
  const slug = kebabCase(name);

  // Allow fixtures to be referenced by their slug,
  // ie. "shops/flower-shop", "shops/department-store", etc.
  fixtures[slug] = { name, slug };
}

module.exports = fixtures;
```

Generated fixture modules are also passed two helper functions when they return a function as a default export. These can be helpful to generate fixtures.

The first is `generateFixtureId` which works the same as when exporting arrays by incrementing a counter.

The second is `loadFixtureModules` which allows you to reference other fixture modules without importing them. This can be useful for complex cases:

```js
// fixtures/comments/index.js

module.exports = async ({ loadFixtureModules, generateFixtureId }) => {
  const posts = await loadFixtureModules('posts');
  const fixtures = {};

  function exportComments(comments) {
    for (let comment of comments) {
      fixtures[generateFixtureId()] = comment;
      exportComments(comment.comments);
    }
  }

  for (let post of Object.values(posts)) {
    exportComments(post.comments);
  }

  return fixtures;
};
```

In this example recursion allows comments to be nested inline along with the posts for better context.

Notes:

- Mongoose by default does not save unknown fields that are not defined in the schema. This allows a `comments` field to exist on a `post` in the fixtures without affecting the imported data for the post.
- Calling `loadFixtureModules` will return an object that is either built by reading subdirectories (the default) or the result of another generated fixture module.
- Generated fixture modules will supercede any other fixtures within the directory. In other words, if a `shops/index.js` file exists, no other files in the `shops` directory will be imported automatically. However, you can of course still `require` and export them. This behavior can be thought of as a gateway allowing you to aggregate, modify, and export customized fixtures.

## Testing

It is often useful to run tests against fixture data. To help facilitate this, fixtures can be imported and accessed easily.

After running the imports, fixtures can be accessed both as nested objects and by the full [id](#fixture-ids), allowing easy referencing and iteration:

```js
const { importFixtures } = require('utils/fixtures');

test('Test against fixtures', async () => {
  const data = await importFixtures();

  expect(data['shops']['demo']).toBe(data['shops/demo']);
});
```

Additionally, `importFixtures` can also be used to import only a subset of the fixtures:

```js
const { importFixtures } = require('utils/fixtures');

test('Test against a single shop', async () => {
  const shop = await importFixtures('shops/demo');
  // ...
});

test('Test against all shops', async () => {
  const shopsById = await importFixtures('shops');
  // ...
});
```

Note that all fixture data is cached, which has implications for testing. For example calling `Users.deleteMany({})` after a test will remove all `User` documents from the database, however running `importFixtures` a second time will return the memoized objects with nothing imported to the db.

There are advantages to this, speed being the main one. An ideal testing scenario will assume a database loaded with base fixtures at the outset and only clean up the specific objects that test has created. However there may be scenarios where this is difficult, so a `resetFixtures` function is also exported by this module. Running it will clear all caches and another call to `importFixtures` will re-import the data, however this may take time!

Note that although calling `importFixtures('shops/demo')` will only import a subset of the fixtures, this may import a lot of data depending on the dependency chain.

## Debugging

Running the script with `LOG_LEVEL=debug` will output detailed information that may be useful for debugging.

## Notes

Note that `users/admin` and `oraganizations/bedrock` are special fixtures required to bootstrap the data. These are defined in `./const`.

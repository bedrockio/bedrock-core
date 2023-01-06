# Models

Bedrock models are based on [Mongoose](https://mongoosejs.com/) but provide a layer of functionality on top.

- [Definitions](#definitions)
- [Autopopulate](#autopopulate)
- [Soft Deletion](#soft-deletion)
- [Validation](#validation)
- [Search](#search)
- [Assign](#assign)

## Definitions

Keeping all model information in JSON allows multiple systems to re-use this valuable meta data. These JSON files can
either be manually used and attached to Mongoose (see `user.js`) or they can be loaded automatically.

The following JSON definition `definitions/category.json`:

```json
{
  "attributes": {
    "name": { "type": "String", "trim": true, "required": true }
  }
}
```

Will be loaded as a `mongoose.models.Category` object. Models automatically populate reference objects (type =
"ObjectId") and have `updatedAt` and `createdAt` timestamps.

All model definition options:

| Key          | Type        | Description                     |
| ------------ | ----------- | ------------------------------- |
| `attributes` | []Attribute | Mongoose Schema with extensions |
| `modelName`  | String      | Optional override for ModelName |

## Attribute Flags

The attributes are the standard Mongoose Schema definition: https://mongoosejs.com/docs/guide.html - but we allow for
some extensions:

| Key      | Type   | Description                                          |
| -------- | ------ | ---------------------------------------------------- |
| `access` | String | If set to `private` it won't be returned in toJSON() |

## Autopopulate

Bedrock uses the [`mongoose-autopopulate`](https://plugins.mongoosejs.io/plugins/autopopulate) plugin to automatically
popluate `ObjectId` references. To enable this specify the `"autopopulate"` option inside the definition files:

```json
"field": {
  "type": "ObjectId",
  "ref": "MyModel",
  "autopopulate": true
}
```

By default population is limited to a depth of `1` to avoid explosive queries. To override this the `maxDepth` be
specified:

```json
"field": {
  "type": "ObjectId",
  "ref": "MyModel",
  "autopopulate": {
    "maxDepth": 2
  }
}
```

## Soft Deletion

In addition to the defualt timestamps `createdAt` and `updatedAt`, Bedrock attaches a `deletedAt` flag that provides
soft delete functionality. Calling `doc.delete()` on a document will perform a soft delete. To perform a hard delete on
a model instead call `doc.destroy()`. Additionally all `find` methods will exclude soft-deleted documents, however the
following methods allow deleted documents to be queried:

- `findDeleted`
- `findOneDeleted`
- `findByIdDeleted`
- `existsDeleted`
- `countDocumentsDeleted`

To query both the following methods are also provided:

- `findWithDeleted`
- `findOneWithDeleted`
- `findByIdWithDeleted`
- `existsWithDeleted`
- `countDocumentsWithDeleted`

## Validation

Bedrock uses [Yada](https://github.com/bedrockio/yada) for validation in routes, and this validation is generated from
the definition files. The following methods are provided:

- `getCreateValidation`
- `getUpdateValidation`
- `getSearchValidation`

These methods are used with the `validateBody` [middleware](../utils/middleware/validate.js) to dynamically generate
validation in the routes:

```js
.post('/', validateBody(Model.getCreateValidation()), async (ctx) => {
  // ...
});
```

Additional validation can be mixed in by passing an object to these methods:

```js
.post('/', validateBody(Model.getCreateValidation({
  category: yd.string(),
})), async (ctx) => {
  // ...
});
```

`getUpdateValidation` will strip out virtuals and reserved fields like `id` allowing a serialized object to be passed in
with updated fields.

`getSearchValidation` allows a variety of alternate valid parameters for searching:

- Search on multiple fields with an array:

  - `num: 1`
  - `num: [1,2,3]`

- Search on ranges for numbers and dates:

  - `num: 5`
  - `num: { gt:5, lt: 10 }`
  - `num: { gte:5, lte: 10 }`
  - `date: '2020-01-01'`
  - `date: { gt: '2020-01-01', lt: '2020-01-01' }`
  - `date: { gte: '2020-01-01', lte: '2020-01-01' }`

## Search

The `Model.search` method is provided as a counterpart to `find` that allows complex search functionality and is
designed to be directly a request body that is validated by `Model.getSearchValidation`. It returns an object with the
search results as `data` and metadata about the search with `meta`:

```js
.post('/', validateBody(Model.getSearchValidation()), async (ctx) => {
  const { data, meta } = await Model.search(ctx.request.body);
  // ...
});
```

A number of fields can be sent into this method to customize the search:

- `keyword`: A field that aggregates text fields into a single search. To use this field either a text index must be
  created on the model or a `"search"` field supplied in the model definition that is an array of text fields to be
  searched on. Valid `ObjectId` strings will also search on the `_id`. field.
- `ids`: An array of ids to search on.
- `skip`: Passed to the mongoose `.skip()` method to allow pagination.
- `limit`: Query limiting. Defaults to `50`.
- `sort`: Query sorting:

  - `sort.field`: The field to sort on. Default is `createdAt`.
  - `sort.order`: Either `asc` or `desc`. Default is `desc`.

The `search` method returns the mongoose `query` objects just like `find` so they can be further refined with
`.populate` etc.

```js
await Model.search().populate('field');
```

Nested object fields will be flattened to their equivalent mongo dot operators:

```json
{
  "nested": {
    "field": 3
  }
}
```

becomes:

```json
{
  "nested.field": 3
}
```

Array fields will be mapped to an $in operator:

```json
{
  "array": [1, 2, 3]
}
```

becomes:

```json
{
  "array": { "$in": [1, 2, 3] }
}
```

Pseudo regexes may also be used following the "/.../" format:

```json
{
  "field": "/^abc$/gi"
}
```

becomes:

```json
{
  "field": {
    "$regex": "^abc$",
    "$options" "gi"
  }
}
```

Finally, `search` may be passed other search related options such as ranges for number or date fields (described
[above](#validation)).

```json
{
  "date": {
    "gte": "2021-01-01"
  }
}
```

becomes:

```json
{
  "date": {
    "$gte": "2021-01-01"
  }
}
```

## Assign

An `assign` methods is provided to update documents, and supports deeply setting nested values. In addition it allows
deletion of reference fields and is designed to be passed a request body:

```js
.patch('/', validateBody(Model.getUpdateValidation()), async (ctx) => {
  model.assign(ctx.request.body);
  await model.save();
});
```

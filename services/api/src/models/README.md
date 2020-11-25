# Models

Keeping all model information in JSON allows multiple systems to re-use this valuable meta data. These JSON files can either be manually used and attached to Mongoose (see `user.js`) or they can be loaded automatically.

The following JSON definition `definitions/category.json`:

```json
{
  "attributes": {
    "name": { "type": "String", "trim": true, "required": true }
  }
}
```

Will be loaded as a `mongoose.models.Category` object. Models automatically populate reference objects (type = "ObjectId") and have `updatedAt` and `createdAt` timestamps.

All model definition options:

| Key          | Type        | Description                     |
| ------------ | ----------- | ------------------------------- |
| `attributes` | []Attribute | Mongoose Schema with extensions |
| `modelName`  | String      | Optional override for ModelName |

## Attribute Flags

The attributes are the standard Mongoose Schema definition: https://mongoosejs.com/docs/guide.html - but we allow for some extensions:

| Key      | Type   | Description                                          |
| -------- | ------ | ---------------------------------------------------- |
| `access` | String | If set to `private` it won't be returned in toJSON() |

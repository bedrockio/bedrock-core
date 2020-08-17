# Resource Generator

The resource generator is a tool to let you quickly scaffold models and their accompanying routes and views.

- [Types](#types)
  - [Primary](#primary)
  - [Secondary](#secondary)
  - [Support](#support)
  - [Which Type to Choose?](#which-type-to-choose)
- [Models](#models)
- [Routes](#routes)
- [Screens](#screens)
- [Modals](#modals)
- [Snapshots](#snapshots)
- [Patches](#patches)

## Types

---

### Primary

Any resource that is core to your app should be considered "primary". Primary resources may refer to other models, however none of these references are "parent" references that are required to contextualize them. Generally they will have their own URL endpoints and list views. `User` is a good example of a primary resource.

### Secondary

Resources that are dependent on a primary resource are considered "secondary". They always contain a reference to their primary resource (via `ObjectId`) which can be considered a "parent". Generally they do not have endpoints or list views except in the context of their parent. `Profile` would be a good example of a secondary resource, as it would not make sense to exist outside the context of a `User`.

### Support

Resources that exist in support of other resources are considered "support". This often takes the form of generalized, polymorphic models. For example an `Image` object is often a child of another resource, however typically is not tied to a specific parent (a `User` may have an image but a `Product` may as well). Support resources will not generate routes, as they are typically not meant to be independently discoverable.

### Which Type to Choose?

There are different factors that go into data modeling, and not all models fit neatly into a single type. A few considerations here may help:

1. Required relationships might still not be "parents". For example a `Tweet` might always require a `User` object, however for the purposes of choosing a type, considering it a primary resource may make more sense if it is intended to be a first-class citizen of your app, for example if it were searchable outside the context of a specific user.

2. Support resources are generally referenced directly from their parents. For example, typically a `User` would have an `Image`, not the other way around. Compare this with a `Profile` which would likely instead refer to a `User`. This is a good indication that `Image` is a support resource and `Profile` is a secondary resource.

3. Support resources generally do not contain many fields. For example a `Profile` could potentially contain a number of separate fields, which is a good indication that it is "secondary", not "support".

---

## Models

Generates Mongoose models based on the schema information. Test stubs will also be generated.

---

## Routes

Generates routes based on the schema information. This includes:

- `POST /` - Creates a new resource.
- `GET /:id` - Fetches the resource with `id`.
- `PATCH /:id` - Updates the resource with `id`.
- `DELETE /:id` - Soft-deletes the resource with `id`.
- `POST /search` - Queries the resource. Fields will be generated based on the schema. `name` is a special field here that will generate a regex query.

---

## Screens

Generates screens based on the schema information. This includes:

- List View - A filterable list of all resources of this type.
- Detail View - An "overview" page for a specific resource.
- Secondary Views - "Secondary references" are generated here as screens. This will list out the secondary resources that belong to this resource.

---

## Modals

Generates create/update modals based on the schema information. This will allow resources of all types to be created and edited. Fields will be generated based on the schema details entered.

---

## Snapshots

Generating a new resource will output a `json` file with the resource name. Re-generating with `--snapshot=resource.json` allows the resource details to be tweaked and re-generated.

---

## Patches

In addition to generating files, this script will attempt to patch `index.js` entrypoints, `App.js` to add routes, and the main menu when generating primary resource links. This behavior can be disabled if it is intrusive.

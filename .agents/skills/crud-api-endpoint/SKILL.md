---
name: crud-api-endpoint
description: Add the CRUD REST endpoints for an existing model in services/api — router, tests, role permissions and the docs portal page, with the response and validation contract they have to follow. Use when asked to create, scaffold, or extend an API endpoint or resource in this repo.
---

# CRUD API endpoint

A CRUD resource is a router mounted under `/1/<resources>`, its colocated tests, an entry in the role
permissions, and a page in the docs portal. The model comes first and is not part of this.

Naming: the model and its definition file are singular (`Product`, `product.json`); the route file and URL
segment are plural kebab-case (`audit-entries.js`, `/1/audit-entries`). Routes live in `src/routes`, tests
beside them as `<resources>.test.js`.

## Prerequisite: the model

This starts from a model that already exists — a definition in `src/models/definitions` with its attributes
and `search` block, loaded and exported from `src/models/index.js`. Write that first if it is missing; the
models README carries the attribute-naming and data-modelling rules.

Everything below derives from it. The request validation and the search behaviour are generated from the
definition, so the endpoints cannot be written against a model that is not settled.

## 1. Router

Five endpoints: create, get, search, update, delete. Authenticate once for the whole router and resolve `:id`
once as a param, so each handler receives the document on `ctx.state` under the model's lowercased name.

```js
const router = new Router();

router
  .use(authenticate())
  .param('id', fetchByParam(Product))
  .post('/', validateBody(Product.getCreateValidation()), async (ctx) => {
    ctx.body = { data: await Product.create(ctx.request.body) };
  })
  .get('/:id', async (ctx) => {
    ctx.body = { data: ctx.state.product };
  })
  .post('/search', validateBody(Product.getSearchValidation({ allowExport: true })), async (ctx) => {
    const { format, filename, ...params } = ctx.request.body;
    const { data, meta } = await Product.search(params);
    if (format === 'csv') {
      return csvExport(ctx, data, { filename });
    }
    ctx.body = { data, meta };
  })
  .patch('/:id', validateBody(Product.getUpdateValidation()), async (ctx) => {
    const { product } = ctx.state;
    product.assign(ctx.request.body);
    await product.save();
    ctx.body = { data: product };
  })
  .delete('/:id', async (ctx) => {
    await ctx.state.product.delete();
    ctx.status = 204;
  });
```

Mount it in the routes index under the plural segment. Listing is a `POST /search` with a body, not a `GET`
with query parameters — the search validation accepts the filter, sort and pagination the model defines, and
`allowExport` adds the `format` and `filename` fields that turn the same call into a CSV download.

Contract: success bodies are always `{ data }`, search adds `{ data, meta }` where `meta.total` is the
unpaginated count, and delete returns `204` with no body. Deletes are soft — the document keeps existing with
a `deletedAt` and is excluded from normal queries.

Validation comes off the model rather than hand-written schemas: create, update, search and delete each have a
generated schema that already reflects the attributes, their requiredness and their access scopes. For
something the definition cannot express — a field that never persists, a cross-field rule — extend the
generated schema instead of replacing it:

```js
User.getCreateValidation()
  .append({ password: yd.string().password() })
  .custom((val) => {
    if (!val.email && !val.phone) {
      throw new Error('email or phone number is required');
    }
  });
```

Replacing it drops the model's access scopes and drifts the moment the definition changes.

## 2. Variants

The router above is the baseline. Apply the ones that fit the resource — each is a deviation to make
knowingly, not a default.

- **Permissions** — gate the router with a permissions middleware when the resource is not readable by every
  authenticated user, either once for the whole router or split between read and write.
- **Creating user** — take it from the authenticated user, never from the request body. The field is named
  `user` for what it points at; `owner` survives only on uploads.
- **Multi-tenancy** — set the organization from request state on create and gate writes on the organization
  scope, so a tenant cannot write into another's data.
- **Guarded delete** — a model can refuse deletion while it is still referenced. Validate the delete and
  translate the resulting error into a `400`, rather than letting it surface as a `500`.
- **Per-document access** — prefer the model definition's `access` block, which grants update and delete to
  named roles and to the document's own user. Use a `hasAccess` check on the param fetch only for rules that
  block cannot express; it answers `403`.

## 3. Audit log

Decide explicitly whether the resource is audited. If it is, follow the [audit-log](../audit-log/SKILL.md)
skill — it covers the create, update and delete entries and the quiet ways they go wrong.

## 4. Tests

Colocated as `src/routes/<resources>.test.js`, Vitest, one `describe` per endpoint. Cover the five endpoints
and any non-trivial authorization; skip trivial cases. Tests assert observable behaviour — status, response
body, and what is actually in the database afterwards.

```js
describe('POST /', () => {
  it('should be able to create product', async () => {
    const user = await createUser();
    const response = await request('POST', '/1/products', { name: 'some other product' }, { user });
    expect(response).toHaveStatus(200);
    expect(response.body.data.name).toBe('some other product');
  });
});
```

The testing helpers create users at each role level and the common referenced documents; `request` takes the
method, path, body and an acting user. Assert status with `toHaveStatus`. For delete, assert the soft delete
by fetching the deleted document and checking `deletedAt`, not by expecting the row to be gone. An audited
resource also asserts its entries.

## 5. Roles

Add the resource to `src/roles.json` for every role that should see it — `"all"` for admins, `"read"` for
viewers. Required even when the router does not check permissions, because the dashboard uses the role
definition to decide what to render.

## 6. Documentation

Regenerate the OpenAPI definition so it picks up the new paths, then add the portal page under
`services/web/src/docs/pages` and register it in that directory's index. One section per endpoint: a heading,
a one-line description, and the route reference that renders the generated request and response schemas.

## 7. Verify

```bash
cd services/api && pnpm test
```

---
name: crud-api-endpoint
description: Add the CRUD REST endpoints for an existing model in services/api (Koa router, audit entries, tests, roles, docs), following the Product resource as the reference implementation. Use when asked to create, scaffold, or extend an API endpoint, resource, or model in this repo.
---

# CRUD API endpoint

Reference implementation: `Product`. Mirror it unless a requirement forces a deviation.

| Concern | File |
| --- | --- |
| Schema (prerequisite) | [`src/models/definitions/product.json`](../../../services/api/src/models/definitions/product.json) |
| Model export (prerequisite) | [`src/models/index.js`](../../../services/api/src/models/index.js) |
| Routes | [`src/routes/products.js`](../../../services/api/src/routes/products.js) |
| Mount | [`src/routes/index.js`](../../../services/api/src/routes/index.js) |
| Tests | [`src/routes/products.test.js`](../../../services/api/src/routes/products.test.js) |
| Audit log | [audit-log](../audit-log/SKILL.md) skill |
| Permissions | [`src/roles.json`](../../../services/api/src/roles.json) |
| API docs | [`src/docs/pages/Products.mdx`](../../../services/web/src/docs/pages/Products.mdx) |

Naming: definition file and model name singular (`product.json`, `Product`); route file and URL segment plural
kebab-case (`audit-entries.js`, `/1/audit-entries`). `fetchByParam` puts the document on
`ctx.state.<lowerFirst(ModelName)>`.

## Prerequisite: the model

This skill starts from a model that already exists: `src/models/definitions/<resource>.json` defining the
attributes and its `search` block, exported through `loadModel` in `src/models/index.js`. If it does not exist
yet, write it first — [`src/models/README.md`](../../../services/api/src/models/README.md) carries the
attribute-naming and data-modelling rules — then come back.

Everything below derives from that definition: `getCreateValidation()` and its siblings are generated from the
attributes, and `Model.search()` filters on `search.fields`.

## 1. Router

Copy [`src/routes/products.js`](../../../services/api/src/routes/products.js) to `src/routes/<resources>.js`
and rename the model, the `ctx.state` key and the local variable. It is the canonical shape: `authenticate()`
and `.param('id', fetchByParam(Model))`, then create, get, search with CSV export, update, delete — in that
order.

Validation comes off the model: `getCreateValidation()`, `getUpdateValidation()`, `getSearchValidation({
allowExport: true })`. For anything the schema cannot express — a field that never persists, a cross-field
rule — extend the generated schema rather than replacing it:

```js
User.getCreateValidation()
  .append({ password: yd.string().password() })
  .custom((val) => {
    if (!val.email && !val.phone) {
      throw new Error('email or phone number is required');
    }
  });
```

A hand-written yada object in place of the generated one drops the model's own access scopes and drifts the
moment the definition changes.

Contract: success bodies are always `{ data }`, search adds `{ data, meta }`, delete is `204` with no body.
`delete()` is a soft delete — the document stays retrievable via `findByIdDeleted`.

Mount it in `src/routes/index.js` (import + `router.use('/products', products.routes())`).

### Variants

- **Permissions** — add `.use(requirePermissions('<resources>.read'))` from
  `../utils/middleware/permissions.js` when the resource is not readable by every authenticated user. See
  [`organizations.js`](../../../services/api/src/routes/organizations.js) (split read/write) and
  [`audit-entries.js`](../../../services/api/src/routes/audit-entries.js). Products deliberately has none.
- **Creating user** — take it from the token, never the body: `Shop.create({ ...ctx.request.body, user:
  ctx.state.authUser._id })`. The field is named `user`, not `owner` — `Upload.owner` is the one legacy
  exception.
- **Multi-tenancy** — set `organization: ctx.state.organization` on create and gate with
  `requirePermissions('<resources>.write', 'organization')`.
- **Guarded delete** — `validateDelete(Model.getDeleteValidation())` plus `try/catch` around `delete()`
  rethrowing as `ctx.throw(400, err)` when references must block removal.
- **Per-document access** — prefer the model definition's `access` block (`shop.json` grants `update`/`delete`
  to `user`, `admin`, `superAdmin`); reach for `fetchByParam(Model, { hasAccess: async (ctx, doc) => ... })`,
  which 403s on failure, only for rules the block cannot express. `{ as: 'name' }` renames the `ctx.state`
  key.

## 2. Audit log

Decide explicitly whether the resource is audited. If it is, follow the [audit-log](../audit-log/SKILL.md)
skill — it covers the `AuditEntry.append()` calls for create, update and delete, and the quiet failures around
`fields` and `snapshot`. `Product` is unaudited; [`shops.js`](../../../services/api/src/routes/shops.js) is
the audited equivalent.

## 3. Tests

`src/routes/<resources>.test.js`, colocated, Vitest, one `describe` per endpoint. Cover the five endpoints and
any non-trivial authorization; skip trivial cases.

```js
import { request, createUser } from '../utils/testing/index.js';
import { Product } from '../models/index.js';

describe('/1/products', () => {
  describe('POST /', () => {
    it('should be able to create product', async () => {
      const user = await createUser();
      const response = await request('POST', '/1/products', { name: 'some other product' }, { user });
      expect(response).toHaveStatus(200);
      expect(response.body.data.name).toBe('some other product');
    });
  });
});
```

Helpers in [`src/utils/testing/index.js`](../../../services/api/src/utils/testing/index.js): `request`,
`createUser`, `createAdmin`, `createSuperAdmin`, `createUpload`, `createTemplate`. Assert status with
`expect(response).toHaveStatus(...)`. Assert soft delete with `findByIdDeleted(...)` then
`expect(doc.deletedAt).toBeDefined()`. When the resource is audited, each mutating test also asserts the entry
— `AuditEntry.findOne({ object: id })` then `activity`, `actor`, `ownerId`, `ownerType`, as in
[`shops.test.js`](../../../services/api/src/routes/shops.test.js).

## 4. Roles

Add the resource key to [`src/roles.json`](../../../services/api/src/roles.json) for every role that should
see it — `"all"` for `superAdmin`/`admin`, `"read"` for `viewer`. Required even when the router does not call
`requirePermissions`, because the dashboard uses it to decide what to render.

## 5. Documentation

Regenerate the OpenAPI definition (`bedrock generate docs`, or `POST /1/docs/generate` against a running API —
see [auth-token](../auth-token/SKILL.md) for a token) so `openapi.json` picks up the new paths, then add the
portal page.

`services/web/src/docs/pages/<Resources>.mdx` — one `##` section per endpoint with a one-line description and
a `<Route />`, closing with `<VisitedSchemas />`; copy
[`Products.mdx`](../../../services/web/src/docs/pages/Products.mdx). Register it in
[`src/docs/pages/index.js`](../../../services/web/src/docs/pages/index.js) (import + `PAGES` entry).

## 6. Verify

```bash
cd services/api && pnpm test
```

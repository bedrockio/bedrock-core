---
name: api-documentation
description: Document an endpoint's request and response in services/api/openapi.json with `documentation.include` — when a route needs it, how to declare response variants and examples, and how the generator and tests check it. Use when adding or changing any route in services/api, when a test fails with "does not match its documentation" or "is not documented", or when the API Schema CI check fails.
---

# API documentation

`services/api/openapi.json` is generated from the routes and committed. Regenerate it after any route change:

```bash
cd services/api && pnpm docs:generate
```

## What is automatic

| Part | Source |
| --- | --- |
| Request body and query | the `validateBody` / `validateQuery` / `validateFiles` schema on the route |
| Authentication, permissions | the `authenticate` and `requirePermissions` middleware |
| CRUD responses | the model: get, create and update return `200 { data: Model }`, search `200 { data: [Model], meta: SearchMeta }`, delete `204` |

A CRUD route that follows that contract needs no annotation.

## When to annotate

Any route whose body is not the CRUD contract. Put one `documentation.include` on the route, after
validation and immediately before the handler:

```js
import documentation from '../utils/documentation.js';

router.post(
  '/login',
  validateBody({ email: yd.string().email().required(), password: yd.string().required() }),
  documentation.include(
    documentation.description('Login', 'Authenticates with email and password.'),
    documentation.success(200, {
      description: 'Password accepted, no MFA configured.',
      schema: { data: { token: yd.string() } },
      example: { data: { token: 'eyJhbGciOi...' } },
    }),
    documentation.success(200, {
      description: 'User has MFA enabled; client must complete the challenge.',
      schema: { data: { mfaRequired: yd.boolean() } },
      example: { data: { mfaRequired: true } },
    }),
  ),
  async (ctx) => {
    // ...
  },
);
```

| Part | Use |
| --- | --- |
| `description(summary, description?)` | Title-case summary and one sentence from the client's view. Overrides the inferred CRUD summary. |
| `success(status, { description, schema, example, name })` | One per distinct body shape; several on one status become a `oneOf`. `204` takes no options. |
| `error(status, description)` | Only for an error a client must handle specially, e.g. a lockout sharing a status with bad credentials, or a non-obvious permission rule. Routine validation, not-found and auth errors stay undocumented. |

`schema` is a yada schema or a plain object of them. A model class (`User`) becomes a `$ref`, and `[User]` an
array of them. `yd.object()` with no fields accepts any object. Leave fields optional: read scopes drop fields
per role.

## Examples

One short `example` per variant whose body is not just a model: fake values, truncated tokens, example.com
addresses. Skip them for model bodies. Each example is validated against its own variant's schema during
`docs:generate`, which fails on a mismatch or a duplicate key (`name`, else a slug of `description`).

## Opaque and binary bodies

Streams, redirects, HTML and bodies clients must not rely on: `success(status, { description })` with no schema.

## Verify

- `pnpm test`: in the test env `include` checks every success body against the variants declared for its
  status. "does not match its documentation" or "is not documented" means the annotation is wrong, or the
  handler changed shape.
- `pnpm docs:generate`, then commit `openapi.json`. The API Schema PR comment lists the response changes.
- Portal: add the route to its page in `services/web/src/docs/pages` with `<Route route="METHOD /path" />`,
  which renders the request params and the generated responses.

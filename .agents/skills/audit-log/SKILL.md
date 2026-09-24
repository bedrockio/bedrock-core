---
name: audit-log
description: Write and verify AuditEntry records for mutating endpoints and security events in services/api — which calls to add, what `fields` and `snapshot` actually control, and why an expected entry is missing or empty. Use when adding audit logging to a route, reviewing whether an endpoint is audited correctly, or debugging the audit log.
---

# Audit log

Every audited action is one `AuditEntry` document, written with `AuditEntry.append(activity, options)`. The
model fills in the request context — method, URL and normalized route path — so a route supplies only what
cannot be inferred from `ctx`.

| Field | Comes from |
| --- | --- |
| `activity` | the first argument — a human-readable string |
| `actor` | `options.actor` / `options.user`, else `ctx.state.authUser` |
| `object`, `objectType` | `options.object`, which must be a mongoose document |
| `objectBefore`, `objectAfter` | the `options.fields` list diffed against `options.snapshot` |
| `ownerId`, `ownerType` | the object's `owner` path, else its `user` path, else `options.ownerPath` |

## Auditing a resource

Audit a resource on all three mutating endpoints, or on none of them. Create and update without delete is the
usual mistake, and it loses the entry a reviewer needs most — the one recording what was destroyed. Not every
resource has to be audited, but that is a decision to make deliberately rather than by omission.

```js
// create — after the document is created
await AuditEntry.append('Created Shop', { ctx, object: shop, fields: ['name', 'user', 'country'] });

// update — snapshot BEFORE assign(), or the diff is empty
const snapshot = new Shop(shop);
shop.assign(ctx.request.body);
await shop.save();
await AuditEntry.append('Updated Shop', { ctx, object: shop, fields: ['name', 'user', 'country'], snapshot });

// delete — after the delete succeeds
await AuditEntry.append('Deleted Shop', { ctx, object: shop });
```

Append after the operation succeeds. A rejected update, or a delete that threw because the document is still
referenced, must leave no entry behind.

## Rules that decide whether the entry is right

These fail quietly. Nothing throws — you get no entry, or an entry that records that something changed without
recording what.

- **Capture `snapshot` before `assign()`.** A snapshot taken afterwards diffs the document against itself, so
  every field looks unchanged.
- **`append()` writes nothing when `fields` is given and none of those fields changed.** An update that
  touches only unlisted fields logs nothing at all, so `fields` has to cover everything worth reviewing.
- **Omitting `fields` records no diff**, only that the activity happened. That is right for delete, where the
  whole document is gone, and wrong for update.
- **Pass the document as `object`, not its id.** Anything else throws.
- **`ownerId` is inferred, not given.** The object's `owner` path is checked first, then `user`; a model with
  neither records no owner unless you pass `ownerPath`, which accepts a nested path such as `location.user`.
- **`actor` defaults to the authenticated user.** Pass it explicitly only when the actor is someone else, as
  when an admin impersonates a user.

## Activity strings

Use `'<Verb> <ModelName>'` for CRUD, spelled identically every time. The audit screen filters on `activity`
and builds its filter options from the distinct values already stored, so a one-off variant of the wording
splits the history in two and adds a near-duplicate entry to that list.

Security and auth events name the event rather than a model, and carry an actor with no object: logins,
logouts, signups, failed password attempts, failed OTP and TOTP verification, and hitting the login attempt
limit. Record that the attempt failed — never the credential that was tried.

## Tests

An audited endpoint asserts its entry inside the test that exercises the endpoint:

```js
const auditEntry = await AuditEntry.findOne({ object: data.id });
expect(auditEntry.activity).toBe('Created Shop');
expect(auditEntry.actor).toEqual(user._id);
expect(auditEntry.ownerId).toBe(user.id);
expect(auditEntry.ownerType).toBe('User');
```

`actor` is an ObjectId, so compare it with `toEqual(user._id)`; `ownerId` is a string, so compare it with
`toBe(user.id)`. For an update, assert `objectBefore` and `objectAfter` too — that is the assertion that
catches a snapshot taken too late. On a create, `objectBefore` stays undefined; only changed fields ever
appear in either.

## Reading them

Searching audit entries requires the `auditEntries.read` permission. The search endpoint also serves the
distinct values behind the activity, object type and route filters, which is what makes the exact wording of
`activity` matter.

Entries outlive what they describe. A model that blocks deletion while it is still referenced must exempt
`AuditEntry` from that check, or the audit trail makes its own objects undeletable.

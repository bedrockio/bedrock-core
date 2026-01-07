# Models

## Data Modeling Best Practices

Design collections and document shapes based on how the application reads and filters data, not only how it writes it.

#### 1. Think hard about the attribute names:

- Avoid abbreviations like `desc`.
- Dates should end with `At`, for example `startsAt`, `signedAt`, etc.
- Prefix booleans with `is`, `has`, `can`, `should`, etc, for example `isActive`.
- Use positive booleans, for example `isActive` instead of `isInactive`.
- Always name reference fields like `user` never `userId` as they may be populated.
- Be consistent with plurality, for example `tags` for an array and `tag` for a single value, `tagCount` for a number.
- Numeric values should have their unit in the name when not obvious, for example `amountCents`.
- Avoid generic names when not directly applicable. For example a user may have a `status` but a contract may have a
  `billingStatus` as well as a `payrollStatus`. When ambiguous always use more explicit naming.
- Store meta data when possible as it makes future migrations and optimizations easier, for example `tags`, `meta`, etc.

#### 2. Avoid direct references in arrays

When doing initial data modeling for a project it's often tempting to put direct ObjectId references into arrays, for
example to store a list of `conditions` on a user.

However as a project evolves a common requirement is to ask something like "when did this condition start?". Storing
direct references in an array in this case is like having a join table in SQL that cannot hold other fields. It will
require a fundamental data model change to fix and often causes downstream issues due to API changes.

Avoiding this from the start will save headaches later. As a convention it is better to nest the object in a key that is
the lowercase form of the object reference:

❌ Avoid:

```jsonc
// In model:
{
  "conditions": [
    {
      "type": "ObjectId",
      "ref": "Condition",
    },
  ],
}

// As data:

{
  "conditions": ["68ed8b92bb75e0aeee461156"]
}

```

✅ Instead do:

```jsonc
// In model:
{
  "conditions": [
    {
      "condition": {
        "type": "ObjectId",
        "ref": "Condition",
      },
    },
  ],
}

// As data:

{
  "conditions": [
    {
      "condition": "68ed8b92bb75e0aeee461156"
    }
  ]
}

```

## Indexing Guidelines

When designing indexes, follow the Equality → Range → Sort (ESR) guideline:

- Equality fields first — fields used in equality filters (=).
- Range fields next — fields used in range queries (<, >, <=, >=).
- Sort fields last — fields used for ordering results.

Reference: https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/#std-label-esr-indexing-guideline

### Index Management Workflow:

Store all database indexes in a dedicated /indexes folder. Do not add indexes directly to the models in src/models. Each
model should have its own index file containing the relevant index commands.

Use the sync script (e.g., scripts/indexes/sync) to apply or update indexes in the database.

## Troubleshooting

##### I get warnings like `The punycode module is deprecated`. What is this?

This warning comes from later node versions and is usually deep in the dependency chain. Add this to your `package.json`
and re-run `yarn install` and it should fix it:

```json
"resolutions": {
  "whatwg-url": "14.1.0"
},
```

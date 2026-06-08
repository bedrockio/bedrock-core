# OpenTelemetry

Require as early as possible — before other imports — so instrumentation is registered before the modules it patches are
loaded.

```js
require('./otel');
```

## Structure

| File         | Purpose                                                 |
| ------------ | ------------------------------------------------------- |
| `index.js`   | Entry point. Sets up tracing and loads metrics.         |
| `metrics.js` | Metric definitions. Exports to Google Cloud Monitoring. |

## Metrics

Pushed to [Google Cloud Monitoring](https://cloud.google.com/monitoring) every 10 minutes.

### Cost

First 150 million samples/month free, then $0.01 per 10,000 samples. At 10 minute intervals each metric produces ~4,300
samples/month. Cost only becomes significant with high-cardinality labels — avoid attaching unbounded values like user
IDs.

### Defined metrics

| Metric          | Type    | Description            |
| --------------- | ------- | ---------------------- |
| `users.signups` | Counter | Number of user signups |

## Adding a new metric

Add it to `metrics.js`. Use:

- `createCounter` — a discrete event you want to count (signups, failed logins). Call it where the event happens.
- `createObservableGauge` — a value that can go up or down, queried on each export (DB counts, queue depth). Snapshot
  only, no history.
- `createHistogram` — distribution of a numeric value (latency, payload size). Use when an average would be misleading.

Rules:

- Metric names use dot notation: `noun.descriptor` (e.g. `users.signups`)
- Never use high-cardinality values as labels — no user IDs, request IDs, or emails
- Add every new metric to the **Defined metrics** table above

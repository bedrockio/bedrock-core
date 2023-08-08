const opentelemetry = require('@opentelemetry/api');
const { Resource } = require('@opentelemetry/resources');
const {
  MeterProvider,
  PeriodicExportingMetricReader,
  View,
  Aggregation,
  InstrumentType,
} = require('@opentelemetry/sdk-metrics');

const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const process = require('process');

const { MetricExporter } = require('@google-cloud/opentelemetry-cloud-monitoring-exporter');
const { GcpDetectorSync } = require('@google-cloud/opentelemetry-resource-util');

const detectorSync = new GcpDetectorSync();
detectorSync.detect();

// Create MeterProvider
const meterProvider = new MeterProvider({
  // this is not 100% correct but it's the best we can do for now
  // until the detectorSync works correctly see: https://github.com/GoogleCloudPlatform/opentelemetry-operations-js/issues/459
  // each pod needs to be unique otherwise errors will appear quickly about INVALID_ARGUMENT.
  resource: new Resource({
    'service.namespace': 'default',
    'host.name': process.env.HOSTNAME,
  }).merge(detectorSync),
  views: [
    new View({
      aggregation: Aggregation.ExponentialHistogram(),
      instrumentType: InstrumentType.HISTOGRAM,
    }),
  ],
});

// enable for debugging
// opentelemetry.diag.setLogger(new opentelemetry.DiagConsoleLogger(), opentelemetry.DiagLogLevel.INFO);

if (process.env.NODE_ENV === 'production') {
  // Register the exporter
  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      // Export metrics every 60 seconds. 5 seconds is the smallest sample period allowed by
      // Cloud Monitoring.
      exportIntervalMillis: 60_000,
      exporter: new MetricExporter(),
    })
  );
}

opentelemetry.metrics.setGlobalMeterProvider(new MeterProvider());

// Create a meter
const applicationMetricsMeter = meterProvider.getMeter('application_metrics');

const httpRequestDuration = applicationMetricsMeter.createHistogram('http_request_duration', {
  description: 'The duration of HTTP requests processed by the application',
  unit: 'ms',
});

function requestDuration(ctx, next) {
  const { req, res } = ctx;
  if (req.method === 'OPTIONS') {
    return next();
  }

  const startTime = Date.now();

  res.once('finish', () => {
    httpRequestDuration.record(Date.now() - startTime, {
      http_status: ctx.response.status || '0',
      path: ctx._matchedRoute || '',
      http_method: ctx.method || '',
    });
  });

  return next();
}

const provider = new NodeTracerProvider();

provider.addSpanProcessor(new BatchSpanProcessor(new TraceExporter()));

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
  tracerProvider: provider,
});

provider.register();

module.exports = {
  requestDuration,
  meterProvider,
  applicationMetricsMeter,
};

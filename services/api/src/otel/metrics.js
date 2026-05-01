const { MeterProvider, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { MetricExporter } = require('@google-cloud/opentelemetry-cloud-monitoring-exporter');

const meterProvider = new MeterProvider({
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new MetricExporter(),
      // we export every 10 minutes to reduce costs
      exportIntervalMillis: 10 * 60 * 1000,
    }),
  ],
});

const meter = meterProvider.getMeter('api');

const signupsCounter = meter.createCounter('users.signups', {
  description: 'Number of user signups',
});

module.exports = { signupsCounter, meterProvider };

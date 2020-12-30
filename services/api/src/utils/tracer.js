const opentelemetry = require('@opentelemetry/api');

const { LogLevel } = require('@opentelemetry/core');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');

const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');

const provider = new NodeTracerProvider({
  logLevel: LogLevel.ERROR,
  plugins: {
    koa: {
      enabled: true,
      path: '@opentelemetry/koa-instrumentation',
    },
    http: {
      enabled: true,
      path: '@opentelemetry/plugin-http',
    },
  },
});

provider.addSpanProcessor(new SimpleSpanProcessor(new TraceExporter()));
provider.register();

module.exports = opentelemetry.trace.getTracer('api');

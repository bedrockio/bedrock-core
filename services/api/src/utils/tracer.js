const opentelemetry = require('@opentelemetry/api');

const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');

const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');

const provider = new NodeTracerProvider({
  plugins: {
    koa: {
      enabled: true,
      path: '@opentelemetry/koa-instrumentation',
      enhancedDatabaseReporting: true,
    },
    http: {
      enabled: true,
      path: '@opentelemetry/plugin-http',
    },
  },
});

if (process.env.NODE_ENV === 'production') {
  // Configure the span processor to send spans to the exporter
  provider.addSpanProcessor(new SimpleSpanProcessor(new TraceExporter()));
  provider.register();
} else {
  // const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
  // provider.addSpanProcessor(new SimpleSpanProcessor(new ZipkinExporter({ serviceName: 'api' })));
}

module.exports = opentelemetry.trace.getTracer('api');

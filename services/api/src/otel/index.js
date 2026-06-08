const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { NodeTracerProvider, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { TraceExporter } = require('@google-cloud/opentelemetry-cloud-trace-exporter');

const provider = new NodeTracerProvider({
  spanProcessors: [
    new BatchSpanProcessor(new TraceExporter(), {
      // max number of spans held in memory before forcing a flush
      maxQueueSize: 2048,
      // how many spans to send in a single export request
      maxExportBatchSize: 512,
      // how often to flush if maxExportBatchSize hasn't been reached (ms)
      scheduledDelayMillis: 2000,
    }),
  ],
});

provider.register();

registerInstrumentations({
  instrumentations: [new HttpInstrumentation()],
});

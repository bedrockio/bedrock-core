const logger = require('@bedrockio/logger');

const { defineJob } = require('../utils/jobs');

// Example background job — copy this shape for real jobs. `getParams` maps the
// call arguments into the plain data stored on the job, and `handler` does the
// work and returns a result. When the result is a `{ resource }` pointer, the
// client-side `requestWithPolling` helper fetches it once the job finishes.
module.exports = defineJob({
  name: 'example',
  getParams(message) {
    return {
      message,
    };
  },
  async handler(params) {
    logger.info(`Running example job: ${params.message}`);
    return {
      message: params.message,
    };
  },
});

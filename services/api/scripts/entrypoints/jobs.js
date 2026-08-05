const process = require('process');
const logger = require('@bedrockio/logger');

const { initialize } = require('../../src/utils/database');
const { startJobProcessor } = require('../../src/utils/jobs');

// Requiring the barrel runs every job's defineJob call, so the processor knows
// how to handle each job name before it starts pulling work off the queue.
require('../../src/jobs');

startProcessor();

async function startProcessor() {
  try {
    await initialize();
    await startJobProcessor();
    logger.info('Job processor started');
  } catch (error) {
    logger.error(`Fatal error starting job processor: ${error.message}`);
    process.exit(1);
  }
}

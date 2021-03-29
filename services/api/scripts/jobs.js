const process = require('process');
const { logger } = require('@bedrockio/instrumentation');
const { initialize } = require('./../src/utils/database');

async function run() {
  await initialize();
  logger.info('Running jobs');
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error(`Fatal error: ${error.message}, exiting.`);
    logger.warn(error.stack);
    process.exit(1);
  });

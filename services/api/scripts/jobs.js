const process = require('process');
const { logger } = require('./../src/utils/logging');
const { initalize } = require('./../src/utils/database');

async function run() {
  await initalize();
  logger.info('Running jobs');
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error(`Fatal error: ${error.message}, exiting.`);
    console.warn(error.stack);
    process.exit(1);
  });

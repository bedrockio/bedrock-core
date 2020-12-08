const process = require('process');
const { logger } = require('./../src/utils/logging');
const { init } = require('./../src/utils/database');

async function run() {
  await init();
  logger.info('Running jobs');
}

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    logger.error(`Fatal error: ${error.message}, exiting.`);
    process.exit(1);
  });

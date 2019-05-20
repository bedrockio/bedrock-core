const process = require('process');
const { logger } = require('./../src/lib/logging');
const database = require('./../src/database');
async function run() {
  await database();
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

const process = require('process');
const logger = require('@bedrockio/logger');
const { initialize } = require('../../src/utils/database');
const { sleep } = require('../../src/utils/sleep');

async function run() {
  await initialize();
  logger.info('Running example job');
  await sleep(30 * 1000);
  logger.info('Done');
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

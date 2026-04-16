const process = require('process');
const logger = require('@bedrockio/logger');
const { initialize } = require('../../src/utils/database');
const { sendNotifications } = require('../../src/utils/notifications');

async function run() {
  await initialize();
  logger.info('Sending notifications');
  await sendNotifications();
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

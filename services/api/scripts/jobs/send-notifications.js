import process from 'process';
import logger from '@bedrockio/logger';
import { initialize } from '../../src/utils/database.js';
import { sendNotifications } from '../../src/utils/notifications.js';

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

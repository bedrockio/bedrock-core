import logger from '@bedrockio/logger';
import config from '@bedrockio/config';

import { initialize } from './utils/database.js';
import { loadFixtures } from './utils/fixtures.js';
import app from './app.js';

const ENV_NAME = config.get('ENV_NAME');
const PORT = config.get('SERVER_PORT', 'number');
const HOST = config.get('SERVER_HOST');

export default (async () => {
  await initialize();
  if (ENV_NAME === 'development') {
    await loadFixtures();
  }
  app.listen(PORT, HOST, () => {
    logger.info(`Started on port //${HOST}:${PORT}`);
    if (ENV_NAME === 'development') {
      logger.info('-----------------------------------------------------------------');
      logger.info(
        `${config.get('APP_NAME')} Admin Login ${config.get('ADMIN_EMAIL')}:${config.get(
          'ADMIN_PASSWORD',
        )} (dev env only)`,
      );
      logger.info('-----------------------------------------------------------------');
    }
  });

  return app;
})();

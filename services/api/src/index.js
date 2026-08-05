const logger = require('@bedrockio/logger');
const config = require('@bedrockio/config');

const { initialize } = require('./utils/database');
const { loadFixtures } = require('./utils/fixtures');
const { startJobProcessor } = require('./utils/jobs');
const app = require('./app');

// Register job definitions so the in-process dev processor (below) can run them.
require('./jobs');

const ENV_NAME = config.get('ENV_NAME');
const PORT = config.get('SERVER_PORT', 'number');
const HOST = config.get('SERVER_HOST');

module.exports = (async () => {
  await initialize();
  if (ENV_NAME === 'development') {
    await loadFixtures();

    // Process jobs in-process locally so dev needs no separate worker; staging
    // and production split it out to the dedicated jobs pod.
    await startJobProcessor();
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

const logger = require('@bedrockio/logger');
const config = require('@bedrockio/config');

const { initialize } = require('./utils/database');
const { loadFixtures } = require('./utils/fixtures');
const app = require('./app');

const ENV_NAME = config.get('ENV_NAME');
const PORT = config.get('SERVER_PORT', 'number');
const HOST = config.get('SERVER_HOST');

if (process.env.NODE_ENV === 'production') {
  logger.setupGoogleCloud({
    tracing: {
      ignoreIncomingPaths: ['/', /^\/1\/status\/*/],
    },
  });
} else {
  logger.useFormatted();
}

module.exports = (async () => {
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
          'ADMIN_PASSWORD'
        )} (dev env only)`
      );
      logger.info('-----------------------------------------------------------------');
    }
  });

  return app;
})();

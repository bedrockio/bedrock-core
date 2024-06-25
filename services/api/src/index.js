const logger = require('@bedrockio/logger');

const { initialize } = require('./utils/database');
const { loadFixtures } = require('./utils/fixtures');
const app = require('./app');

const { ENV_NAME, SERVER_PORT, SERVER_HOST, APP_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

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
  app.listen(SERVER_PORT, SERVER_HOST, () => {
    logger.info(`Started on port //${SERVER_HOST}:${SERVER_PORT}`);
    if (ENV_NAME === 'development') {
      logger.info('-----------------------------------------------------------------');
      logger.info(`${APP_NAME} Admin Login ${ADMIN_EMAIL}:${ADMIN_PASSWORD} (dev env only)`);
      logger.info('-----------------------------------------------------------------');
    }
  });

  return app;
})();

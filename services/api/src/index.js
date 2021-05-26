const { logger, setupTelemetry } = require('@bedrockio/instrumentation');

if (process.env.NODE_ENV === 'production') {
  setupTelemetry({
    http: {
      ignoreIncomingPaths: ['/'],
    },
  });
}

const { initialize } = require('./utils/database');
const { createFixtures } = require('./fixtures');
const app = require('./app');

const config = require('@bedrockio/config');

const ENV_NAME = config.get('ENV_NAME');
const PORT = config.get('SERVER_PORT', 'number');
const HOST = config.get('SERVER_HOST');

module.exports = (async () => {
  await initialize();
  if (ENV_NAME === 'development') {
    await createFixtures();
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

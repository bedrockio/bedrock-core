const { initalizeTelemetry, logger } = require('@bedrockio/instrumentation');
initalizeTelemetry();

const app = require('./app');
const config = require('@bedrockio/config');
const { getBrowser } = require('./utils/browser');

const PORT = config.get('BIND_PORT');
const HOST = config.get('BIND_HOST');

module.exports = (async () => {
  await getBrowser();

  app.listen(PORT, HOST, () => {
    logger.info(`Started on port //${HOST}:${PORT}`);
  });
  return app;
})();

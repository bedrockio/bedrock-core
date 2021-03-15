const { initalize: setup } = require('@bedrockio/instrumentation');
setup();

const { initalize } = require('./utils/database');
const { createFixtures } = require('./fixtures');
const app = require('./app');

const config = require('@bedrockio/config');

const ENV_NAME = config.get('ENV_NAME');
const PORT = config.get('BIND_PORT', 'number');
const HOST = config.get('BIND_HOST');

module.exports = (async () => {
  await initalize();
  if (ENV_NAME === 'development') {
    await createFixtures();
  }

  app.listen(PORT, HOST, () => {
    console.info(`Started on port //${HOST}:${PORT}`);
    if (ENV_NAME === 'development') {
      console.info('-----------------------------------------------------------------');
      console.info(
        `${config.get('APP_NAME')} Admin Login ${config.get('ADMIN_EMAIL')}:${config.get(
          'ADMIN_PASSWORD'
        )} (dev env only)`
      );
      console.info('-----------------------------------------------------------------');
    }
  });

  return app;
})();

const { init } = require('./database');
const setupFixtures = require('../scripts/setup-fixtures');
const app = require('./app');

const config = require('@bedrockio/config');
if (process.env.GCLOUD_PROJECT) {
  require('@google-cloud/trace-agent').start();
}

const NODE_ENV = process.env.NODE_ENV;

const PORT = config.get('BIND_PORT', 'number');
const HOST = config.get('BIND_HOST');

module.exports = (async () => {
  await init();
  await setupFixtures();

  app.listen(PORT, HOST, () => {
    console.info(`Started on port //${HOST}:${PORT}`);
    if (NODE_ENV === 'dev') {
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

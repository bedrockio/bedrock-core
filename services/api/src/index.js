const database = require('./database');
const setupFixtures = require('../scripts/setup-fixtures');
const app = require('./app');
const config = require('@kaareal/config');

const NODE_ENV = process.env.NODE_ENV;

const PORT = config.get('BIND_PORT');
const HOST = config.get('BIND_HOST');

module.exports = (async () => {
  await database();
  await setupFixtures();

  app.listen(PORT, HOST, () => {
    console.info(`Started on port //${HOST}:${PORT}`);
    if (NODE_ENV === 'dev') {
      console.info('-----------------------------------------------------------------');
      console.info(
        `Admin Login ${config.get('ADMIN_EMAIL')}:${config.get('ADMIN_PASSWORD')} (only visibile in dev env)`
      );
      console.info('-----------------------------------------------------------------');
    }
  });

  return app;
})();

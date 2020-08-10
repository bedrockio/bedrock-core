import database from './database';
import setupFixtures from '../scripts/setup-fixtures';
import app from './app';

import config from '@bedrockio/config';
if (process.env.GCLOUD_PROJECT) {
  require('@google-cloud/trace-agent').start();
}

const NODE_ENV = process.env.NODE_ENV;

const PORT = config.get('BIND_PORT');
const HOST = config.get('BIND_HOST');

export default (async () => {
  await database();
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

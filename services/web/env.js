const { pick } = require('lodash');
const config = require('@bedrockio/config');

const ENV_NAME = config.get('ENV_NAME');

const all = {
  DEV: ENV_NAME === 'development',
  PROD: ENV_NAME === 'production',
  STAGING: ENV_NAME === 'staging',
  ...config.getAll(),
};

module.exports = {
  ...all,
  publicEnv: pick(all, [
    'ENV_NAME',
    'DEV',
    'PROD',
    'STAGING',
    'API_URL',
    'APP_NAME',
    'SENTRY_DSN',
    'GOOGLE_API_KEY',
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'AUTH0_REDIRECT_PATH',
    'INTERCOM_APP_ID',
  ]),
};

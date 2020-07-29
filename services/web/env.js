const { pick } = require('lodash');
const config = require('@bedrockio/config');

const NODE_ENV = config.get('NODE_ENV');

const all = {
  DEV: NODE_ENV === 'development',
  PROD: NODE_ENV === 'production',
  STAGING: NODE_ENV === 'staging',
  ...config.getAll(),
};

module.exports = {
  ...all,
  publicEnv: pick(all, [
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
  ])
};


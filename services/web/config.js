const { pick } = require('lodash');
const config = require('@kaareal/config');

const all = config.getAll();

module.exports = {
  ...all,
  publicEnv: pick(all, [
    'API_URL',
    'APP_NAME',
    'SENTRY_DNS'
  ])
};


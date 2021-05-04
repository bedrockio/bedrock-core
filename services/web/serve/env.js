const { pick } = require('lodash');
const config = require('@bedrockio/config');

const allConfig = config.getAll();
const PUBLIC = pick(
  allConfig,
  Object.keys(allConfig).filter(
    (key) => !key.startsWith('SERVER') && !key.startsWith('HTTP')
  )
);

module.exports = {
  ...allConfig,
  PUBLIC,
};

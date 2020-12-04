const { loadModelDir } = require('../lib/utils/schema');

module.exports = {
  User: require('./user'),
  ...loadModelDir(__dirname + '/definitions'),
};

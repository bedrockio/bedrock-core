const { loadModelDir } = require('../utils/schema');

module.exports = {
  User: require('./user'),
  ...loadModelDir(__dirname + '/definitions'),
};

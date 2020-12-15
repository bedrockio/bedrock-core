const { loadModelDir } = require('../utils/schema');

module.exports = {
  User: require('./user'),
  Role: require('./role'),
  ...loadModelDir(__dirname + '/definitions'),
};

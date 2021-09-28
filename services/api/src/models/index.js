const { loadModelDir } = require('../utils/schema');

module.exports = {
  User: require('./user'),
  Video: require('./video'),
  AuditEntry: require('./audit-entry'),
  ...loadModelDir(__dirname + '/definitions'),
};

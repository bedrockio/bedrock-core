const { loadModelDir } = require('../utils/schema');

module.exports = {
  User: require('./user'),
  AuditEntry: require('./audit-entry'),
  ...loadModelDir(__dirname + '/definitions'),
};

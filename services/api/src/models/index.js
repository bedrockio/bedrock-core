const { loadModelDir } = require('../utils/schema');

module.exports = {
  User: require('./user'),
  AuditEntry: require('./audit-entry'),
  ApplicationRequest: require('./application-request'),
  ...loadModelDir(__dirname + '/definitions'),
};

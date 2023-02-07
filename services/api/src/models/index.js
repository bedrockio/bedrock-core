const { loadModelDir } = require('@bedrockio/model');

module.exports = {
  User: require('./user'),
  AuditEntry: require('./audit-entry'),
  ApplicationRequest: require('./application-request'),
  // TODO: load with error handling
  ...loadModelDir(__dirname + '/definitions'),
};

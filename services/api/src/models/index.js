const { loadModelDir } = require('../utils/schema');

module.exports = {
  User: require('./user'),
  AuditLog: require('./audit-log'),
  ...loadModelDir(__dirname + '/definitions'),
};

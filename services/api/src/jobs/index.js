// Barrel of every background job, keyed by name. Requiring it runs each job's
// defineJob call, which both registers the handler with the processor and
// builds the enqueue object consumers import (e.g. example.queue). Add new jobs
// here.
module.exports = {
  example: require('./example'),
  sendNotifications: require('./send-notifications'),
};

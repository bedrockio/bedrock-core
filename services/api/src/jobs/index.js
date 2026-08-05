// Barrel of every background job, keyed by name. Requiring it runs each job's
// defineJob call, which registers the handler with the processor (and its cron,
// for scheduled jobs). For on-demand jobs the value is also the handle
// consumers import to enqueue (e.g. `job.queueWithResponse`). Add new jobs here.
module.exports = {
  sendNotifications: require('./send-notifications'),
};

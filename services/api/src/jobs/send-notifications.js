const logger = require('@bedrockio/logger');

const { defineJob } = require('../utils/jobs');
const { sendNotifications } = require('../utils/notifications');

// Scheduled job: sends any pending notifications that are due. Runs every 10
// minutes on the jobs pod (and in the dev api process).
module.exports = defineJob({
  name: 'send-notifications',
  schedule: '*/10 * * * *',
  async handler() {
    logger.info('Sending notifications');
    await sendNotifications();
    logger.info('Done');
  },
});

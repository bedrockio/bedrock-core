#!/bin/bash
echo "Setting crontab"
env >> /etc/environment
# Every 15 minutes
echo "*/15 * * * * cd /api; node scripts/jobs.js >> /api/crontab.log 2>> /api/crontab.log" >> cron
crontab cron
rm cron
echo "Running all jobs for first time"
node /api/scripts/jobs.js >> /api/crontab.log 2>> /api/crontab.log
crond &&
tail -f /api/crontab.log

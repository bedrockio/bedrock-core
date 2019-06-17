#!/bin/bash
echo "Setting crontab"
env >> /etc/environment
# Every 5 minutes
echo "*/5 * * * * cd /service; node scripts/jobs.js >> /service/crontab.log 2>> /service/crontab.log" >> cron
crontab cron
rm cron
echo "Running all jobs for first time"
node /service/scripts/jobs.js >> /service/crontab.log 2>> /service/crontab.log
crond &&
tail -f /service/crontab.log

#!/bin/bash
echo "Setting crontab"
env >> /etc/environment
# Every 10 minutes
echo "*/10 * * * * cd /service; node scripts/jobs.js >> /service/crontab.log 2>> /service/crontab.log" >> cron
# Every Monday at 9am
# echo "0 9 * * MON cd /service; node scripts/jobs.js >> /service/crontab.log 2>> /service/crontab.log" >> cron
# At the hour
# echo "0 * * * * cd /service; node scripts/jobs.js >> /service/crontab.log 2>> /service/crontab.log" >> cron
crontab cron
rm cron
echo "Running all jobs for first time"
node /service/scripts/jobs.js >> /service/crontab.log 2>> /service/crontab.log
crond &&
tail -n 1000 -f /service/crontab.log

#!/bin/bash
echo "CLI Started" > crontab.log
tail -n 10000 -f /service/crontab.log

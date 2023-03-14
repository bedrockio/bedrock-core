#!/bin/bash
echo "" > /service/crontab.log
if [ "$ENV_NAME" == "production" ]; then
  echo "Skipping fixtures load in production"
else
  ./scripts/fixtures/load
fi
echo "" > /service/.motd
echo "Welcome to the API CLI pod. All API code is available here." >> /service/.motd
echo "" >> /service/.motd
echo "Example commands:" >> /service/.motd
echo "  export                                         # Check env variables" >> /service/.motd
echo "  curl api:2300/1/status                         # See API status" >> /service/.motd
echo "  curl elasticsearch:9200/_cat/indices           # List Elasticsearch indices" >> /service/.motd
echo "  curl elasticsearch:9200/_cluster/health | jq   # Elasticsearch cluster health" >> /service/.motd
echo "  yarn fixtures:load                             # Load DB fixtures" >> /service/.motd
echo "  yarn fixtures:reload                           # Drop DB and load fixtures (dev/staging only)" >> /service/.motd
echo "" >> /service/.motd
echo "cat /service/.motd" >> /root/.bashrc
tail -n 10000 -f /service/crontab.log

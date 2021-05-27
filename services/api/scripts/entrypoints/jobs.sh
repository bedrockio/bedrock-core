#!/bin/bash

echo "" > /service/.motd
echo "Welcome to the API Jobs pod. All API code is available here." >> /service/.motd
echo "" >> /service/.motd
echo "Example commands:" >> /service/.motd
echo "" >> /service/.motd
echo "  # List all jobs that are running on this pod:"
echo "  curl -s -H \"Accept: application/json\" localhost:2600/status | jq" >> /service/.motd
echo "" >> /service/.motd
echo "  # Force the start of a scheduled job:"
echo "  curl -s -XPOST localhost:2600/jobs/example/start" >> /service/.motd
echo "" >> /service/.motd
echo "cat /service/.motd" >> /root/.bashrc

YACRON_FILE=$1
if [ "$YACRON_FILE" == "" ]; then
  echo "No jobs YAML specified"
  exit 1
fi
# All settings below are defaults that can be overriden in the jobs/ YAML definitions
cat >/service/job-base.yml <<EOL
defaults:
  captureStdout: true
  captureStderr: true
  killTimeout: 30
  failsWhen:
    producesStdout: false
    producesStderr: false
    nonzeroReturn: true
    always: false
  onFailure:
    retry:
      maximumRetries: 10
      initialDelay: 1
      maximumDelay: 30
      backoffMultiplier: 2
EOL

if [ "$SENTRY_DSN" != "" ]; then
cat >>/service/job-base.yml <<EOL
  onPermanentFailure:
    report:
      sentry:
        dsn:
          value: $SENTRY_DSN
        fingerprint:
          - yacron
          - "{{ environment.HOSTNAME }}"
          - "{{ name }}"
        level: warning
EOL
fi
cat >>/service/job-base.yml <<EOL
web:
  listen:
    - http://127.0.0.1:2600
EOL
yq eval-all '. as $item ireduce ({}; . * $item )' /service/job-base.yml $YACRON_FILE > /service/job.yml
/root/.local/bin/yacron -c job.yml
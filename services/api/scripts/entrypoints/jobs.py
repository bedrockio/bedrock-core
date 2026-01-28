#!/usr/bin/env python3
"""
Entrypoint script for yacron job runner.

This script configures logging before importing yacron to ensure all startup
messages go to stdout. Without this, yacron's "web: started listening" message
goes to stderr before the logging config in the YAML is applied, causing false
positive errors in GCP logging.

See: https://github.com/gjcarneiro/yacron/issues/96
"""
import logging
import os
import subprocess
import sys

# Configure logging BEFORE yacron imports. Yacron applies its logging config
# after the web server starts, so the startup message goes to stderr by default.
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter('%(message)s'))
logging.root.addHandler(handler)
logging.root.setLevel(logging.INFO)

if len(sys.argv) < 2:
    print("No jobs YAML specified")
    sys.exit(1)

yacron_file = sys.argv[1]

# Set up MOTD for interactive shell sessions
motd = """
Welcome to the API Jobs pod. All API code is available here.

Example commands:

  # List all jobs that are running on this pod:
  curl -s -H "Accept: application/json" localhost:2600/status | jq

  # Force the start of a scheduled job:
  curl -s -XPOST localhost:2600/jobs/example/start
"""

with open("/service/.motd", "w") as f:
    f.write(motd)

with open("/root/.bashrc", "a") as f:
    f.write("cat /service/.motd\n")

# Build base job config with sensible defaults.
# These can be overridden in the jobs/ YAML definitions.
job_base = """defaults:
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
web:
  listen:
    - http://127.0.0.1:2600
"""


sentry_dsn = os.environ.get("SENTRY_DSN", "")
env_name = os.environ.get("ENV_NAME", "")

if sentry_dsn:
    job_base += f"""  onPermanentFailure:
    report:
      sentry:
        dsn:
          value: {sentry_dsn}
        fingerprint:
          - yacron
          - "{{{{ environment.HOSTNAME }}}}"
          - "{{{{ name }}}}"
        level: error
        environment: {env_name}
"""

with open("/service/job-base.yml", "w") as f:
    f.write(job_base)

# Merge base config with the specified job config
subprocess.run([
    "yq", "eval-all", ". as $item ireduce ({}; . * $item)",
    "/service/job-base.yml", yacron_file
], stdout=open("/service/job.yml", "w"), check=True)

# Run yacron directly by importing its main function.
# This preserves our logging configuration.
sys.argv = ["yacron", "-c", "job.yml"]

from yacron.__main__ import main  # type: ignore

main()

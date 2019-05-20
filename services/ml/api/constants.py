
import os
import sys
import logging

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s')

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

ENVIRONMENT = os.getenv('PYTHON_ENV', 'development')
MONGO_HOST = os.getenv('MONGO_HOST', 'localhost')
MONGO_URL = 'mongodb://'+MONGO_HOST+':27017/'
MONGO_DB = os.getenv('MONGO_DB', 'platform_' + ENVIRONMENT)

MAILER_FROM = 'notifier@platform.com'
MAILER_INBOUND = 'info@platform.com'
MAILER_POSTMARK_API_KEY = ''

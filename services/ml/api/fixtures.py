
import logging
import time
import constants
from bson.objectid import ObjectId
from bcrypt import hashpw, gensalt
from models import create_model
import md5


def create_fixtures(db):
    model = db.models.find_one({'name': 'Test'})
    if model:
        return
    logging.info('Creating fixtures in MongoDB')
    create_model(db, 'Test')

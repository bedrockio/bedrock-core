
from bson.objectid import ObjectId
from bcrypt import hashpw, gensalt
import md5
import jwt
import time
import constants
import datetime
from copy import deepcopy
from utils import sanitize_result


def _set_model_defaults(doc):
    doc['created_ts'] = time.time()
    doc['latest_version'] = 0


def create_model(db, type, name, **kwargs):
    doc = {}
    _set_model_defaults(doc)
    for key in kwargs:
        doc[key] = kwargs[key]
    doc['type'] = type
    doc['name'] = name
    job = db.models
    inserted_id = job.insert_one(doc).inserted_id
    return get_model(db, inserted_id)


def remove_model(db, id):
    job = db.models
    return job.remove({'_id': ObjectId(id)})


def get_model(db, id):
    job = db.models
    return job.find_one({'_id': ObjectId(id)})


def save_model(db, model):
    job = db.models
    return job.save(model)


def list_models(db, **kwargs):
    collection = db.models
    return list(collection.find(kwargs))

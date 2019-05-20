
import os
import json
import urllib
import sys
import traceback
import api.constants as constants
import logging
import csv
from flask import Flask, g, jsonify
from pymongo import MongoClient
from mongomock import MongoClient as MongoClientMock
from bson.objectid import ObjectId
test_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.append(test_dir + '/../')

for _ in ["elasticsearch", "urllib3", "PIL"]:
    logging.getLogger(_).setLevel(logging.CRITICAL)


def setup_db():
    client = MongoClient(constants.MONGO_URL)
    db = client.api_test
    return db


def setup_mock_db():
    client = MongoClientMock(constants.MONGO_URL)
    db = client.api_test
    return db


def create_flask_app(mock=False, db=None):
    if db is None:
        if mock:
            db = setup_mock_db()
        else:
            db = setup_db()

    def before_setup_db():
        g.db = db
    app = Flask(__name__)
    app.before_request(before_setup_db)

    @app.errorhandler(KeyError)
    def handle_key_error(error):
        error = {
            'message': 'Missing required parameter: {}'.format(error.message)
        }
        return jsonify({'error': error})

    @app.errorhandler(Exception)
    def handle_exception(error):
        # traceback.print_exc()
        error = {'message': str(error), 'type': str(type(error).__name__)}
        return jsonify({'error': error})

    return app


def api_post(app, endpoint, params={}, token=None, delete=False, wait=True):
    headers = None
    if token:
        headers = {}
        headers['Authorization'] = 'Bearer {}'.format(token)
    method = app.post
    if delete:
        method = app.delete
    res = method(
        endpoint,
        data=json.dumps(params),
        content_type='application/json',
        headers=headers
    )
    if res.data[0] != '{':
        raise Exception('Invalid Response from API: {}'.format(res.data))
    data = json.loads(res.data)
    if wait is True and data.get('queued', None):
        time.sleep(1)
        return api_post(
            app, endpoint,
            params=params,
            token=token,
            delete=delete,
            wait=wait
        )
    error = data.get('error', None)
    result = data.get('result', None)
    return error, result


def api_get(app, endpoint, params=None, token=None, wait=True, raw=False):
    if params:
        endpoint += '?{}'.format(urllib.urlencode(params))
    headers = None
    if token:
        headers = {}
        headers['Authorization'] = 'Bearer {}'.format(token)
    res = app.get(endpoint, headers=headers)
    if raw is True:
        return res
    if res.data[0] != '{':
        raise Exception('Invalid Response from API: {}'.format(res.data))
    data = json.loads(res.data)
    if wait is True and data.get('queued', None):
        time.sleep(1)
        return api_get(app, endpoint, params=params, token=token, wait=wait)
    error = data.get('error', None)
    result = data.get('result', None)
    return error, result


def load_csv(file_path):
    with open(file_path, 'rU') as csvfile:
        reader = csv.reader(csvfile)
        i = 0
        keys = None
        items = []
        for row in reader:
            if i == 0:
                keys = row
            else:
                item = {}
                for j in range(0, len(keys)):
                    item[keys[j]] = row[j]
                items.append(item)
            i += 1
    return items

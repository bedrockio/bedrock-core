
from flask import Blueprint, request, jsonify, redirect, g
import logging
import time

import api.constants as constants
from ..models import *
from ..utils import sanitize_result

app = Blueprint('models', __name__)


@app.route("", methods=['POST'])
def route_create_model():
    params = request.get_json()
    model = create_model(
        g.db, params['type'],
        params['name'],
        description=params.get('description', '')
    )
    return jsonify({'result': sanitize_result(model)})


@app.route("", methods=['GET'])
def route_list_models():
    models = list(list_models(g.db))
    return jsonify({
        'result': sanitize_result(models)
    })


@app.route("/<model_id>", methods=['GET'])
def route_get_model(model_id):
    model = get_model(g.db, model_id)
    return jsonify({
        'result': sanitize_result(model)
    })


@app.route("/<model_id>", methods=['POST'])
def route_update_model(model_id):
    model = get_model(g.db, model_id)
    params = request.get_json()
    valid_fields = [
        'name',
        'description'
    ]
    for key in params:
        if key not in valid_fields:
            raise Exception('Not a valid updateable field: {}'.format(key))
        if key == 'name' and len(params['name']) == 0:
            raise Exception('Field name cannot be blank')
        model[key] = params[key]
    save_model(g.db, model)
    return jsonify({'result': sanitize_result(model)})


@app.route("/<model_id>", methods=['DELETE'])
def route_remove_model(model_id):
    model = get_model(g.db, model_id)
    if not model:
        raise Exception('Model not found')
    remove_model(g.db, str(model['_id']))
    return jsonify({'result': {'success': True}})

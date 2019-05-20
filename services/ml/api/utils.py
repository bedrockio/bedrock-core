
from flask import request, jsonify, redirect, g, Response
import json


class NotFoundError(Exception):

    def __init__(self, object_type, object_id):
        message = 'Could not find {} with ID {}'.format(object_type, object_id)
        super(Exception, self).__init__(message)


def response_with_optional_filename(res):
    if type(res).__name__ == 'str':
        res = Response(res)
    filename = request.args.get('filename', None)
    if filename is not None:
        cd = 'attachment; filename="{}"'.format(filename)
        res.headers['Content-Disposition'] = cd
    return res


def sanitize_result(result):
    if type(result) == type([]):
        for item in result:
            if item.has_key('_id'):
                item['_id'] = str(item['_id'])
    else:
        if result and result.has_key('_id'):
            result['_id'] = str(result['_id'])
    return result

import os
import sys
import unittest
import json
my_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.append(my_dir + '/../../')
sys.path.append(my_dir + '/../')
from utils import *
from api.routes.models import app as models_app
from api.models import *

db = setup_mock_db()
app = create_flask_app(mock=True, db=db)

app.register_blueprint(models_app, url_prefix='/1/models')


class RoutesModelsTest(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()

    def test_crud(self):
        params = {
            'type': 'performance_prediction',
            'name': 'Model 1'
        }

        # Create model
        error, result = api_post(self.app, '/1/models', params)
        self.assertEquals(error, None)
        self.assertEquals(result['type'], 'performance_prediction')
        model = result

        params = {
            'name': 'Funky'
        }

        # Get model
        error, result = api_get(self.app, '/1/models/{}'.format(model['_id']))
        self.assertEquals(error, None)
        self.assertEquals(result['_id'], str(model['_id']))

        # List models
        error, result = api_get(self.app, '/1/models')
        self.assertEquals(error, None)
        self.assertEquals(result[0]['_id'], str(model['_id']))

        # Update model
        error, result = api_post(
            self.app,
            '/1/models/{}'.format(model['_id']), params)
        self.assertEquals(error, None)
        error, result = api_get(self.app, '/1/models/{}'.format(model['_id']))
        self.assertEquals(error, None)
        self.assertEquals(result['name'], 'Funky')

        # Delete model
        error, result = api_post(
            self.app,
            '/1/models/{}'.format(model['_id']),
            params={'confirm': True},
            delete=True
        )
        self.assertEquals(error, None)


if __name__ == "__main__":
    unittest.main()

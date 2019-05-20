# Platform ML Service

- Flask
- Pycodestyle/pep8
- Env based configuration

## API Routes

All routes are name spaced with a v1 version:

```
POST    /1/models                                                # Create model, requires `type` and `name`
GET     /1/models                                                # List models
GET     /1/models/:model_id                                      # Get model
POST    /1/models/:model_id                                      # Update model
DELETE  /1/models/:model_id                                      # Delete model
```

## Setting up environment

```
make env
```

## Configuration

All defaults are set in `api/constants.py`:

## Unit Tests

```
make test
```

## Running

```
./env/bin/python run.py
```

The API can now be accessed at [http://localhost:2100](http://localhost:2100). To run via Gunicorn:

```
make gunicorn
```

To adjust the number of workers, either edit the Makefile or use the `GUNICORN_NUM_WORKERS` env variable.

## Deployment / Docker

```bash
docker build -t my-api .
```

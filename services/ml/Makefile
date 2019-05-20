
PYTHON_ENV ?= development
GUNICORN_NUM_WORKERS ?= 15
GUNICORN_BIND_HOST ?= localhost
GUNICORN_BIND_PORT ?= 2100

.PHONY: clean
clean:
	rm -Rf test/*.pyc
	find api -name '*.pyc' -delete

.PHONY: env
env:
	rm -rf env;
	virtualenv --no-wheel --no-setuptools --no-pip env
	./env/bin/python -m ensurepip
	./env/bin/pip install -U pip
	make install

.PHONY: install
install:
	./env/bin/pip install -r requirements.txt

UNIT_TEST_FILES := $(wildcard test/*_test.py test/routes/*_test.py)
.PHONY: test
test: $(UNIT_TEST_FILES)
	PYTHON_ENV=test $(foreach file,$(UNIT_TEST_FILES),./env/bin/python $(file);)

INTEGRATION_TEST_FILES := $(wildcard test/integration/*_test.py)
.PHONY: test.integration
test.integration: $(INTEGRATION_TEST_FILES)
	PYTHON_ENV=test $(foreach file,$(INTEGRATION_TEST_FILES),./env/bin/python $(file);)

.PHONY: gunicorn
gunicorn:
	export PYTHON_ENV=$(PYTHON_ENV) && ./env/bin/python ./bin/ensure_fixtures && ./env/bin/gunicorn --timeout 1800 --access-logfile - --error-logfile - --workers=$(GUNICORN_NUM_WORKERS) --bind=$(GUNICORN_BIND_HOST):$(GUNICORN_BIND_PORT) run:app

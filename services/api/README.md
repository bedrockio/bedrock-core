# Bedrock API

![Run Tests](https://github.com/bedrockio/bedrock-core/workflows/Tests/badge.svg)

## API Documentation

See http://localhost:2200/docs for full documentation on this API (requires running the web interface).

---

- [Directory Structure](#directory-structure)
- [Dependencies](#dependencies)
- [Testing](#testing)
- [Running in Development](#running-in-development)
- [Configuration](#configuration)
- [Secrets](#secrets)
- [Deployment](#deployment)
- [Background Jobs](#background-jobs)
- [Fixtures](#fixtures)
- [Multi Tenancy](#multi-tenancy)
- [Email Templates](#email-templates)
- [Logging](#logging)
- [Documentation](#documentation)
- [Multi Factor Authentication](#multi-factor-authentication)

---

## Directory Structure

- `.env` - Default configuration values (override via environment)
- `package.json` - Configure dependencies
- `src/**/__tests__` - Unit tests
- `src/utils` - Various utilities, helpers and middleware extensions
- `src/routes` - API Routes
- `src/routes/__openapi__` - OpenAPI descriptions for use in documentation portal
- `src/models` - Mongoose ORM models (code and JSON) based on [@bedrockio/model](https://github.com/bedrockio/model).
- `src/app.js` - Entrypoint into API (does not bind, so can be used in unit tests)
- `src/index.js` - Launch script for the API
- `emails` - Email templates
- `scripts` - Scripts and jobs
- `fixtures` - Database [fixtures](#fixtures).

## Dependencies

Ensure Node.js version uniformity using Volta:

```
curl -sSLf https://get.volta.sh | bash
```

Install dependencies: (will install correct Node.js version)

```
yarn install
```

## Testing

```
yarn test
```

## Running in Development

Code reload using nodemon:

```
yarn start
```

This command will automatically populate MongoDB fixtures when and empty DB is found.

## Configuration

All configuration is done using environment variables. The default values in `.env` can be overwritten using environment
variables.

- `SERVER_HOST` - Host to bind to, defaults to `"0.0.0.0"`
- `SERVER_PORT` - Port to bind to, defaults to `2300`
- `MONGO_URI` - MongoDB URI to connect to, defaults to `mongodb://localhost/bedrock_dev`
- `JWT_SECRET` - JWT secret used for token signing and encryption
- `ADMIN_NAME` - Default dashboard admin user name `admin`
- `ADMIN_EMAIL` - Default dashboard admin user `admin@bedrock.foundation`
- `ADMIN_PASSWORD` - Default dashboard admin password
- `APP_NAME` - Default product name to be used in emails `Bedrock`
- `APP_URL` - URL for app defaults to `http://localhost:2200`
- `POSTMARK_FROM` - Reply email address `no-reply@bedrock.foundation`
- `POSTMARK_API_KEY` - APIKey for Postmark
- `POSTMARK_DEV_TO` - Email recipient to send development mails for debugging.
- `UPLOADS_STORE` - Method for uploads. `local` or `gcs` (Google Cloud Storage)
- `UPLOADS_GCS_BUCKET` - GCS bucket for uploads
- `SENTRY_DSN` - Sentry error monitoring credentials
- `TWILIO_ACCOUNT_SID` - Twilio Account SID (required for MFA SMS)
- `TWILIO_AUTH_TOKEN` - Twillio Auth token (required for MFA SMS)
- `TWILIO_MESSAGING_SERVICE_SID` - Twillio Messaging Service SID (required for MFA SMS)

## Secrets

No production secrets should ever be checked into your repository. Instead, use the deployment
[secrets](../../deployment#secrets) facility to store secrets remotely.

## Deployment

See [../../deployment](../../deployment/).

## Background Jobs

The API provides a simple Docker container for running Cronjobs. The container uses
[Yacron](https://github.com/gjcarneiro/yacron) to provide a reliable cron job system with added features such as
timezones, concurrency policies, retry policies and Sentry error monitoring.

Example configuration of a 10 minute job `jobs/default.yml`:

```yaml
defaults:
  timezone: America/New_York
jobs:
  - name: example
    command: node scripts/jobs/example.js
    schedule: '*/10 * * * *' # Human readable: https://crontab.guru/
    concurrencyPolicy: Forbid
```

To build the container:

```
docker build -t bedrock-api-jobs -f Dockerfile.jobs .
```

Different job configurations can be specified by changing the entry point when running the container. E.g in Kubernetes:

```yaml
command:
  - './scripts/entrypoints/jobs.sh jobs/default.yml'
```

To list all scheduled jobs on a running container:

```bash
curl -s -H "Accept: application/json" localhost:2600/status | jq
```

To force run a scheduled job:

```bash
curl -s -XPOST localhost:2600/jobs/example/start
```

## Fixtures

Fixtures are provided with the [@bedrockio/fixtures](https://github.com/bedrockio/fixtures) package.

Package scripts are the main way of interacting with fixtures:

- `yarn start` - When the development server starts, fixtures will be loaded if the database is empty.
- `yarn fixtures:reload` - Drops the database and reloads all fixtures.
- `yarn fixtures:load` - Loads fixtures if the database is empty. Fixtures are not auto-loaded in non-development
  environments as multiple pods starting up at the same time can cause data duplication, so instead this script is used
  to provision the data once through the CLI pod.
- `yarn fixtures:export` - Exports documents as a zip file in a format compatible with the `fixtures` directory.

Additionally, a function `importFixtures` manually imports fixtures for use with testing.

You can force reload fixtures with the command:

```
yarn fixtures:reload
```

_Note: In the staging environment this script can be run by obtaining a shell into the API CLI pod (see
[../../deployment](../../deployment/README.md))_

The `yarn fixtures:export` script exports documents as a zip file in a format compatible with the `fixtures` directory.
This allows database changes to be "baked" in as fixtures. The following options are accepted:

- `--model(s)`: Comma separated list of model names to export (required).
- `--id(s)`: Comma separated list of ObjectIds to export.
- `--stdout`: Write zip binary to stdout.

In addition to baking local changes, an accompanying CLI command `bedrock cloud export` allows fixtures to be exported
from a remote cloud environment:

`bedrock cloud export [environment]`

Run `bedrock cloud export --help` for usage.

## Multi Tenancy

The API is "multi tenant ready" and can be modified to accommodate specific tenancy patterns:

- Single Tenant per platform deployment: Organization model could be removed.
- Basic Multi Tenancy: Each request will result in a "Default" organization to be set. This can be overriden using the
  "Organization" header.
- Managed Multi Tenancy: Manually add new organizations in the "Organizations" CRUD UI in the dashboard. Suitable for
  smaller enterprise use cases.
- Self Serve Multi Tenancy; Requires changes to the register mechanism to create a new Organization for each signup.
  Suitable for broad SaaS.
- Advanced Multi Tenancy; Allow users to self signup and also be invited into multiple organizations. Requires expaning
  the user model and invite mechanism to allow for multiple organizations.

Example Create API call with multi tenancy enabled:

```js
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  // Only allow access to users that have write permissions for this organization
  .use(requirePermissions({ endpoint: 'shops', level: 'write', context: 'organization' }))
  .post(
    '/',
    validate({
      body: schema,
    }),
    async (ctx) => {
      const shop = await Shop.create({
        // Set the organization for each object created
        organization: ctx.state.organization,
        ...ctx.request.body,
      });
      ctx.body = {
        data: shop,
      };
    }
  );
```

## E-Mail Templates

E-mail templates can be found in `emails`. There is a layout.html that contains the styling and default layout, and a
template for each email, that gets injected into the layout. Multiple layouts are supported, just make sure you specify
what layout to use when calling `template({ layout: "other-layout.html", template: "..." })`

You can either use markdown or full html templates. Both are run though https://mustache.github.io/ for templating

### To create a button in markdown

```
**[Reset Password]({{{APP_URL}}}/reset-password?token={{token}})**
```

This translates to

```
<p><a class="button" href="{{{APP_URL}}}/reset-password?token={{token}}">Reset Pasword</a/</p>
```

(note this only works if the `strong` link is the only element inside the paragraph)

### Recall to unescape `APP_URL`

We are using mustache for templating, it will attempt to escape the http:`//` which causes issues. So when using the the
`APP_URL` write `{{&APP_URL}}`

## Logging

`@bedrockio/logger` provides structured logging in the console and both [logging](https://cloud.google.com/logging/) and
[tracing](https://cloud.google.com/trace) in Google Cloud environments:

```js
if (process.env.NODE_ENV === 'production') {
  logger.setupGoogleCloud();
}
```

In Google Cloud environments generally the server and jobs (`jobs/`) should use the above initialization to allow
structured error reporting in the cloud console. Development environments and scripts (`scripts/`) meant to be run in a
terminal do not require this setup step.

The logger allows multiple log levels:

```js
logger.trace('Very verbose message.');
logger.debug('Less verbose message.');
logger.info('Normal message.');
logger.warning('Warning message.');
logger.error('Error message.');
```

In development environments the default level is `info`, hiding `trace` and `debug` messages. This can be overridden
with `LOG_LEVEL`. In Google Cloud environments all levels are output.

## Documentation

Good API documentation needs love, so make sure to take the time to describe parameters, create examples, etc. The
[Bedrock CLI](https://github.com/bedrockio/bedrock-cli) can generate documentation using the command:

```
bedrock generate docs
```

After generation, documentation can be found and augmented in the files:

```
services/api/src/routes/__openapi__/resource.json
services/web/src/docs/RESOURCE.md
```

The format in `src/routes/__openapi__` is using a slimmed down version of the OpenAPI spec to make editing easier. API
calls can be defined in the `paths` array and Object definitions can be defined in the `objects` array.

Here's an example of an API call definition:

```json
{
  "method": "POST",
  "path": "/login",
  "requestBody": [
    {
      "name": "email",
      "description": "E-mail address of the user trying to log in",
      "required": true,
      "schema": {
        "type": "string",
        "format": "email"
      }
    },
    {
      "name": "password",
      "description": "Password associated with the e-mail address",
      "required": true,
      "schema": {
        "type": "string"
      }
    }
  ],
  "responseBody": [
    {
      "name": "data.token",
      "description": "JWT token that can be used to authenticate user",
      "schema": {
        "type": "string"
      }
    }
  ],
  "examples": [
    {
      "name": "A new login from John Doe",
      "requestBody": {
        "email": "john.doe@gmail.com",
        "password": "AN$.37127"
      },
      "responseBody": {
        "data": {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZTZhOWMwMDBmYzY3NjQ0N2RjOTkzNmEiLCJ0eXBlIjoidXNlciIsImtpZCI6InVzZXIiLCJpYXQiOjE1ODk1NjgyODQsImV4cCI6MTU5MjE2MDI4NH0.I0DhLK9mBHCy8sJglzyLHYQHFfr34UYyCFyTaEgFFG"
        }
      }
    }
  ]
}
```

All information in `src/routes/__openapi__` is exposed through the API and used by the Markdown-powered documentation
portal in `/services/web/src/docs`.

See [../../services/web](../../services/web) for more info on customizing documentation.

## Multi Factor Authentication

By default multi factor authentication with a authenticator app (1password, lastpassword etc) works out of the box, but
for sms verification you have to have a [Twilio](https://www.twilio.com/) account.

In Twilio you need to create an account, that will generate the (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN) to get
TWILIO_MESSAGING_SERVICE_SID you have to create a
[messaging service](https://support.twilio.com/hc/en-us/articles/223181308-Getting-started-with-Messaging-Services).

To disable mfa: Update the login endpoint to not check for `mfa.requireChallenge`

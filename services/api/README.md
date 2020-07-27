# Bedrock API

![Run Tests](https://github.com/bedrockio/bedrock-core/workflows/Tests/badge.svg)

## API Documentation

See http://localhost:2200/docs for full documentation on this API (requires running the web interface).

## Directory Structure

- `env.conf` - Default configuration values (override via environment)
- `package.json` - Configure dependencies
- `src/*/__tests__` - Unit tests
- `src/index.js` - Entrypoint for running and binding API
- `src/lib` - Library files like utils etc
- `src/v1` - Routes
- `src/v1/__openapi__` - OpenAPI descriptions for use in documentation portal
- `src/middlewares` - Middleware extensions
- `src/models` - Models for ORM (Mongoose)
- `src/app.js` - Entrypoint into API (does not bind, so can be used in unit tests)
- `src/index.js` - Launch script for the API
- `emails/dist` - Prebuild emails templates (dont modify => modify emails/src and run `yarn emails`)
- `emails/src` - Emails templates

## Install Dependencies

Ensure Node.js version uniformity using Volta:

```
curl -sSLf https://get.volta.sh | bash
```

Install dependencies: (will install correct Node.js version)

```
yarn install
```

## Testing & Linting

```
yarn test
```

## Running in Development

Code reload using nodemon:

```
yarn start
```

## Configuration

All configuration is done using environment variables. The default values in `env.conf` can be overwritten using environment variables.

- `BIND_HOST` - Host to bind to, defaults to `"0.0.0.0"`
- `BIND_PORT` - Port to bind to, defaults to `2300`
- `MONGO_URI` - MongoDB URI to connect to, defaults to `mongodb://localhost/bedrock_dev`
- `JWT_SECRET` - JWT secret for authentication, defaults to `[change me]`
- `ADMIN_EMAIL` - Default root admin user `admin@bedrock.foundation`
- `ADMIN_PASSWORD` - Default root admin password `[change me]`
- `APP_NAME` - Default product name to be used in emails 'Bedrock
- `APP_URL` - URL for app defaults to `http://localhost:2200`
- `POSTMARK_FROM` - Reply email address `no-reply@bedrock.foundation`
- `POSTMARK_APIKEY` - APIKey for Postmark `[change me]`
- `UPLOADS_STORE` - Method for uploads. `local` or `gcs`
- `UPLOADS_GCS_BUCKET` - GCS bucket for uploads

## Building the Container

```
docker build -t bedrock-api .
```

See [../../deployment](../../deployment/) for more info

## Configuring Background Jobs

The API provides a simple Docker container for running Cronjobs. The Cron schedule can be configured in `scripts/jobs-entrypoint.sh`. Tip: use https://crontab.guru/ to check your cron schedule.

```
docker build -t bedrock-api-jobs -f Dockerfile.jobs .
```

## Auto-generating API Documentation

Good API documentation needs love, so make sure to take the time to describe parameters, create examples, etc.

There's a script that automatically generates an OpenAPI definition for any added routes.

Run:

```
node scripts/generate-openapi.js
```

The information in `src/v1/__openapi__` is exposed through the API and used by the Markdown-powered documentation portal in `/services/web/src/docs`.

See [../../services/web](../../services/web) for more info

## Updating E-Mail Templates

E-mail templates can be found in `emails/src`. When changes are made, run the following command to optimize the emails for mail readers:

```
yarn emails
```

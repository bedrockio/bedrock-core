# Bedrock API

![Run Tests](https://github.com/bedrockio/bedrock-core/workflows/Tests/badge.svg)

## Directory Structure

- `package.json` - Configure dependencies
- `config/defaults.json` - Default configuration, all values can be controlled via env vars
- `config/custom-environment-variables.json` - Overwrite configuration with defined environment variables
- `src/*/__tests__` - Unit tests
- `src/index.js` - Entrypoint for running and binding API
- `src/lib` - Library files like utils etc
- `src/v1` - Routes
- `src/middlewares` - Middleware libs
- `src/models` - Models for ORM (Mongoose)
- `src/app.js` - Entrypoint into API (does not bind, so can be used in unit tests)
- `src/index.js` - Launch script for the API
- `emails/dist` - Prebuild emails templates (dont modify => modify emails/src and run `npm run emails`)
- `emails/src` - Emails templates

## API Summary -

```
POST /1/auth/register              # New user registration. Requires `email`
POST /1/auth/login                 # Login, returns JWT `token`
POST /1/auth/accept-invite         # Accept admin user invite
POST /1/auth/request-password      # Send user password reset instructions to `email`
POST /1/auth/set-password          # Use temporary `token` to set new `password` for user
GET /1/users/me                    # Get all data for currently logged in user
PATCH /1/users/me                  # Update user's settings
POST /1/users                      # Admin: Create user
POST /1/users/search               # Admin: List and filter all users
GET /1/users/:id                   # Admin: Get user object
PATCH /1/users/:id                 # Admin: Update user
DELETE /1/users/:id                # Admin: Delete user
POST /1/invites/search             # Admin: List and filter all invites
POST /1/invites                    # Admin: Invite user
POST /1/invites/:id/resend         # Admin: Resend invite
DELETE /1/invites/:id              # Admin: Delete invite
POST /1/uploads                    # Multi-part upload of `file`
GET /1/uploads/:hash               # Get upload object by upload `hash`
GET /1/uploads/:hash/image         # Use `hash` to render uploaded file or redirect to it
DELETE /1/uploads/:id              # Delete uploaded file by owner
POST /1/shops                      # Create shop
POST /1/shops/search               # List and filter all shops
GET /1/shops/:id                   # Get shop object
PATCH /1/shops/:id                 # Update shop
DELETE /1/shops/:id                # Delete shop
POST /1/products                   # Create product for `shopId`
POST /1/products/search            # List and filter all products
GET /1/products/:id                # Get product object
PATCH /1/products/:id              # Update products
DELETE /1/products/:id             # Delete product
```

See `services/api-docs` for full documentation on this API.

## Install Dependencies

```
yarn install
```

Ensure environment is the same using Notion:

```
curl -sSLf https://get.volta.sh | bash
```

## Testing & Linting

```
yarn test
```

## Running in Development

Code reload using nodemon:

```
yarn dev
```

## Configuration

All configuration is done using environment variables. The default values in `env.conf` can be overwritten using environment variables.

- `BIND_HOST` - Host to bind to, defaults to `"0.0.0.0"`
- `BIND_PORT` - Port to bind to, defaults to `2300`
- `MONGO_URI` - MongoDB URI to connect to, defaults to `mongodb://localhost/bedrock_dev`
- `JWT_SECRET` - JWT secret for authentication, defaults to `[change me]`
- `ADMIN_EMAIL` - Default root admin user `admin@bedrock.com`
- `ADMIN_PASSWORD` - Default root admin password `[change me]`
- `APP_NAME` - Default product name to be used in emails 'Bedrock
- `APP_URL` - URL for app defaults to `http://localhost:2200`
- `POSTMARK_FROM` - Reply email address `no-reply@bedrock.com`
- `POSTMARK_APIKEY` - APIKey for Postmark `[change me]`
- `UPLOADS_STORE` - Method for uploads. `local` or `gcs`
- `UPLOADS_GCS_BUCKET` - GCS bucket for uploads

## Building the Container

```
docker build -t bedrock-api .
```

See [../../deployment](../deployment/) for more info

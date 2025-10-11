# Bedrock API Service - Agents Guide

This guide provides AI agents with specific information about working on the Bedrock API service.

## Service Overview

The Bedrock API is a RESTful JSON API service built with:
- **Node.js** - Runtime environment
- **Koa** - Web framework
- **MongoDB** - Database (via Mongoose ORM)
- **JWT** - Authentication

API Documentation: http://localhost:2200/docs (requires web service running)

## Directory Structure

Key directories and their purposes:

```
services/api/
├── .env                    - Environment configuration
├── package.json            - Dependencies
├── src/
│   ├── index.js           - Launch script
│   ├── app.js             - Main application entrypoint
│   ├── models/            - Mongoose ORM models (JSON & code)
│   ├── routes/            - API route handlers
│   │   └── __openapi__/   - OpenAPI documentation
│   ├── utils/             - Helper utilities and middleware
│   │   └── auth/          - Authentication utilities
│   └── __tests__/         - Unit tests
├── scripts/               - Helper scripts and background jobs
├── fixtures/              - Database fixtures
└── emails/                - Email templates
```

## Development

### Setup
```bash
cd services/api
yarn install
```

### Running in Development
```bash
yarn start  # Runs with nodemon for auto-reload
```

Automatically populates MongoDB fixtures when DB is empty.

### Testing
```bash
yarn test
```

### Configuration
All configuration via environment variables (see `.env` file):
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `SERVER_PORT` - API port (default: 2300)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - Default admin credentials
- `POSTMARK_API_KEY` - Email service
- `TWILIO_*` - SMS/MFA configuration
- `UPLOADS_STORE` - Upload storage method (local/gcs)
- `SENTRY_DSN` - Error monitoring

## Code Patterns

### Models
Models use [@bedrockio/model](https://github.com/bedrockio/model):
- JSON schema definitions in `src/models/*.json`
- JavaScript implementations in `src/models/*.js`
- Mongoose models with built-in validation and serialization

### Routes
- Routes organized by resource in `src/routes/`
- Authentication routes in `src/routes/auth/`
- OpenAPI documentation in `src/routes/__openapi__/`

### Authentication
Multiple authentication methods supported:

#### Password Authentication
- Default method in `src/routes/auth/password.js`
- Optional MFA: OTP (SMS/Email), TOTP (Authenticator apps)
- MFA configuration in user model

#### OTP Authentication
- SMS via Twilio (`src/routes/auth/otp.js`)
- Email via Postmark
- Testing users (`isTester: true`) always receive OTP: `111111`

#### Passkey Authentication
- WebAuthn-based in `src/routes/auth/passkey.js`
- Requires HTTPS (use Cloudflare Tunnel for local dev)
- No MFA required (inherently secure)

#### Federated Authentication
- Apple Sign-In (`src/routes/auth/apple.js`)
- Google Sign-In (`src/routes/auth/google.js`)

### Utilities
Common utilities in `src/utils/`:
- `middleware/` - Express/Koa middleware
- `auth/` - Authentication helpers
- `validation.js` - Input validation
- `tokens.js` - JWT handling

## Background Jobs

Jobs use [Yacron](https://github.com/gjcarneiro/yacron) in Docker containers.

Job configuration in `jobs/*.yml`:
```yaml
defaults:
  timezone: America/New_York
jobs:
  - name: example-job
    command: node scripts/jobs/example.js
    schedule: '*/10 * * * *'  # Every 10 minutes
    concurrencyPolicy: Forbid
```

Build jobs container:
```bash
docker build -t bedrock-api-jobs -f Dockerfile.jobs .
```

## Documentation

### Generating API Documentation
Use [Bedrock CLI](https://github.com/bedrockio/bedrock-cli):
```bash
bedrock generate docs
```

### Documentation Files
- `src/routes/__openapi__/*.json` - Simplified OpenAPI specs
- `services/web/src/docs/*.md` - Markdown documentation

### OpenAPI Format
Example API call definition:
```json
{
  "method": "POST",
  "path": "/login",
  "requestBody": [
    {
      "name": "email",
      "required": true,
      "schema": { "type": "string" }
    }
  ],
  "responseBody": [
    {
      "name": "token",
      "schema": { "type": "string" }
    }
  ]
}
```

## Testing Guidelines

- Tests in `src/**/__tests__/` directories
- Use Jest for testing framework
- Test authentication flows thoroughly
- Mock external services (Twilio, Postmark)
- Don't modify unrelated tests

## Common Tasks

### Adding a New Model
1. Create JSON schema in `src/models/[name].json`
2. Create model implementation in `src/models/[name].js`
3. Add validation and business logic
4. Create fixtures if needed

### Adding a New Route
1. Create route file in `src/routes/[resource].js`
2. Add authentication middleware as needed
3. Implement CRUD operations
4. Create OpenAPI documentation in `__openapi__/`
5. Add tests

### Adding a Background Job
1. Create job script in `scripts/jobs/[name].js`
2. Add job configuration to `jobs/[config].yml`
3. Test locally before deploying

## Multi-Tenancy

The API supports multi-tenancy:
- Organization-based isolation
- User-organization relationships
- Scoped queries and permissions

## Email Templates

Email templates in `src/templates/email/`:
- Markdown format with variable interpolation
- Used for: welcome, password reset, OTP, MFA notifications, invites
- Test with `POSTMARK_DEV_TO` environment variable

## Logging

- Structured logging with `@bedrockio/instrumentation`
- Sentry integration for error tracking
- Request/response logging middleware

## Security Considerations

- Never commit secrets to repository
- Use environment variables for sensitive data
- Validate all user inputs
- Implement proper authentication/authorization
- Use HTTPS in production
- Keep dependencies updated

## Troubleshooting

- Check MongoDB connection: `MONGO_URI` environment variable
- Verify Node.js version: use Volta
- Clear `node_modules` and reinstall if dependency issues
- Check logs in console output
- Use debugger or add console.log for debugging

## Additional Resources

- [Main API README](README.md)
- [Bedrock Model Documentation](https://github.com/bedrockio/model)
- [Bedrock CLI](https://github.com/bedrockio/bedrock-cli)
- [Koa Documentation](https://koajs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)

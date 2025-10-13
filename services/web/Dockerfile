# Note we are using a multi-stage build to keep the resulting image small.
# As docker layers are immutable this is the only way to reduce size.

# Base Stage
FROM node:22.20.0-alpine AS base

# Yarn will not install any package listed in devDependencies if the NODE_ENV
# environment variable is set to production. Use this flag to instruct Yarn to
# ignore NODE_ENV and take its production-or-not status from this flag instead.
ARG NODE_ENV=production

# Note layers should be ordered from less to more likely to change.

# Update & install required packages
RUN apk add --update bash curl;

# Set work directory
WORKDIR /service

# Install dependencies
COPY package.json yarn.lock ./
COPY serve/package.json serve/yarn.lock ./serve/

RUN yarn install --frozen-lockfile

# Copy app source
COPY . .

# Build Stage
FROM base AS build

# Build app
RUN yarn build

# Clean up to reduce image size
RUN rm -rf src/ node_modules/

# Final Stage
FROM node:22.20.0-alpine

WORKDIR /service

EXPOSE 2200

COPY --from=build /service .

CMD ["yarn", "run", "static"]

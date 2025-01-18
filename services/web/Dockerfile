# Base stage
FROM node:22.13.0-alpine AS base

# Yarn will not install any package listed in devDependencies if the NODE_ENV
# environment variable is set to production. Use this flag to instruct Yarn to
# ignore NODE_ENV and take its production-or-not status from this flag instead.
ARG NODE_ENV=production

# Note layers should be ordered from less to more likely to change.

# Update & install required packages
RUN apk add --update bash curl;

# Set work directory
WORKDIR /service

# Install dependencies and store yarn cache
COPY package.json yarn.lock ./
COPY serve/package.json serve/yarn.lock ./serve/
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

# Copy app source
COPY . .

# build stage
FROM base AS build


# Build and store webpack cache
RUN --mount=type=cache,target=./.webpack-cache yarn build

RUN rm -rf src/
RUN rm -rf node_modules/

## Default (deployment image)
FROM node:20.12.2-alpine
WORKDIR /service

EXPOSE 2200

COPY --from=build /service .

CMD ["yarn", "run", "static"]

FROM node:18.13.0-alpine

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
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install --frozen-lockfile

# Copy app source
COPY . .

# Build and store webpack cache
RUN --mount=type=cache,target=./node_modules/.cache/webpack yarn build

EXPOSE 2200

CMD ["yarn", "run", "static"]

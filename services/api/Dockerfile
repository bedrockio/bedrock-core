FROM node:16.13.0-alpine

# Yarn will not install any package listed in devDependencies if the NODE_ENV
# environment variable is set to production. Use this flag to instruct Yarn to
# ignore NODE_ENV and take its production-or-not status from this flag instead.
ARG NODE_ENV=production

# Note layers should be ordered from less to more likely to change.

# Update & install required packages
RUN apk add --update bash curl;

COPY scripts/install_githooks /service/scripts/install_githooks

# Needed for Gcloud Storage resumable file uploads
RUN mkdir -p /root/.config

# Install app dependencies
COPY package.json /service/package.json
COPY yarn.lock /service/yarn.lock
RUN cd /service; yarn install --frozen-lockfile;

# Copy app source
COPY . /service

# Set work directory to /api
WORKDIR /service

# Set your port
ENV PORT 2300

# Expose the port to outside world
EXPOSE 2300

# Start production server
CMD ["yarn", "start:production"]

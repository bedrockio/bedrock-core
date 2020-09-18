FROM node:12-alpine

# Yarn will not install any package listed in devDependencies if the NODE_ENV environment variable is set to production. Use this flag to instruct Yarn to ignore NODE_ENV and take its production-or-not status from this flag instead.
ARG NODE_ENV=production

# Install app dependencies
COPY package.json /service/package.json
COPY yarn.lock /service/yarn.lock

# Update & install required packages
RUN apk add --update bash curl;
RUN cd /service; yarn install --frozen-lockfile;

# Copy app source
COPY . /service

# Set work directory to /api
WORKDIR /service

# set your port
ENV PORT 2300

# expose the port to outside world
EXPOSE  2300

# Needed for Gcloud Storage resumable file uploads
RUN mkdir -p /root/.config

# start command as per package.json
CMD ["node", "src/index"]

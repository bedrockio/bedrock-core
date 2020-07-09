FROM node:12-alpine

ARG NODE_ENV=production

# Install app dependencies
COPY package.json /service/package.json
COPY yarn.lock /service/yarn.lock

# Update & install required packages
RUN apk add --update bash git make python g++ curl; \
  cd /service; \
  yarn install --frozen-lockfile; \
  yarn --force add bcrypt --build-from-source; \
  apk del python make g++

# Copy app source
COPY . /service

# Set work directory to /api
WORKDIR /service

# set your port
ENV PORT 2300

# expose the port to outside world
EXPOSE  2300

# start command as per package.json
CMD ["node", "src/index"]

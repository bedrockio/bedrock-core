FROM node:12-alpine

ARG NODE_ENV=production

# Install app dependencies
COPY package.json /service/package.json
COPY yarn.lock /service/yarn.lock

# Update & install required packages
RUN apk add --update bash git make python g++ curl; \
  cd /service; \
  yarn install --frozen-lockfile; \
  apk del python make g++

# Copy app source
COPY . /service/

# Set work directory to /api
WORKDIR /service

EXPOSE 2400

CMD ["yarn", "static"]

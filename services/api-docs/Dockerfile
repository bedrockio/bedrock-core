FROM node:12-alpine
ARG NODE_ENV=production

RUN apk add --no-cache bash git python make g++ bash

COPY ./package.json /service/package.json
COPY ./yarn.lock /service/yarn.lock

RUN cd /service; yarn install --frozen-lockfile

# Copy app source
COPY . /service/

# Set work directory to /api
WORKDIR /service

EXPOSE 2400

CMD ["yarn", "static"]

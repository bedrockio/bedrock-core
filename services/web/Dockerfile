FROM node:10-alpine

RUN apk add --no-cache bash git python make g++ bash

COPY ./package.json /service/package.json
COPY ./yarn.lock /service/yarn.lock


RUN cd /service; yarn install --production=true

# Copy app source
COPY . /service/

# Set work directory to /api
WORKDIR /service/

RUN yarn build

# Slim down container
RUN apk del git python make g++

EXPOSE 2200

CMD ["yarn", "run", "static"]

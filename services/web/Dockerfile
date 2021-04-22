FROM node:14-alpine

ARG NODE_ENV=production

COPY ./package.json /service/package.json
COPY ./yarn.lock /service/yarn.lock

# Update & install required packages
RUN apk add --update bash curl;
RUN cd /service; yarn install --frozen-lockfile --ignore-scripts;

# Copy app source
COPY . /service/

# Set work directory to /api
WORKDIR /service/

RUN yarn build

EXPOSE 2200

CMD ["yarn", "run", "static"]

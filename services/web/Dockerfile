FROM node:14.17.3-alpine3.11

ARG NODE_ENV=production

COPY package.json /service/package.json
COPY yarn.lock /service/yarn.lock
COPY scripts/install_githooks service/scripts/install_githooks

# Update & install required packages
RUN apk add --update bash curl;
RUN if [ "$NODE_ENV" = "development" ]; then cd /service; yarn install --frozen-lockfile; fi

# Copy app source
COPY . /service/

# Set work directory to /api
WORKDIR /service/

RUN yarn build

EXPOSE 2200

CMD ["yarn", "run", "static"]

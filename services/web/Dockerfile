FROM node:14-alpine

ARG NODE_ENV=production

COPY ./package.json /service/package.json
COPY ./yarn.lock /service/yarn.lock

# Install required packages
RUN cd /service; yarn install --frozen-lockfile

# Copy app source
COPY . /service/

# Set work directory to /api
WORKDIR /service/

RUN yarn build

EXPOSE 2200

CMD ["yarn", "run", "static"]

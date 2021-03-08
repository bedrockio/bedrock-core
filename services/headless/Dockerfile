FROM node:14.15.4-alpine3.10

ARG NODE_ENV=production

RUN apk add --no-cache \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont \
  nodejs \
  yarn

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

COPY package.json /service/package.json
COPY yarn.lock /service/yarn.lock

RUN cd /service; yarn install;

RUN echo chromium-browser --version

# Copy app source
COPY . /service

# Set work directory to /api
WORKDIR /service

# set your port
ENV PORT 2305

# expose the port to outside world
EXPOSE 2305

# start command as per package.json
CMD ["node", "src/index"]
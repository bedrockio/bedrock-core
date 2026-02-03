# Base layer has core package deps
FROM node:24.12.0-alpine AS base

RUN apk add --update bash curl

WORKDIR /service

# Build layer runs root yarn install and builds the app.
# Note that layers are immutable so node_modules will
# persist in the image even if removed. This is why the
# production stage copies only the files it needs.
FROM base AS build

ARG NODE_ENV=production

COPY package.json yarn.lock ./
COPY serve/package.json serve/yarn.lock ./serve/

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

# Dev target exposed here for docker compose
FROM build AS dev

EXPOSE 2200

CMD ["yarn", "start"]

# Production (default) build copies over files
# without node_modules to keep the image small.
FROM base

EXPOSE 2200

COPY --from=build /service/dist ./dist
COPY --from=build /service/serve ./serve
COPY .env .

CMD ["node", "serve/static.js"]
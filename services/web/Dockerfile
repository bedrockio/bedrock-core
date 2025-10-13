# Note we are using a 2-stage build to keep the resulting image small.
# As docker layers are immutable this is the only way to reduce size.

# Build Stage
FROM node:22.20.0-alpine AS build

ARG NODE_ENV=production

WORKDIR /service

COPY package.json yarn.lock ./
COPY serve/package.json serve/yarn.lock ./serve/

RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Final Stage
FROM node:22.20.0-alpine

WORKDIR /service

RUN apk add --update bash curl

COPY --from=build /service .

EXPOSE 2200

CMD ["yarn", "run", "static"]

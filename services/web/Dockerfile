# Base layer has core package deps
FROM node:26.3.0-alpine AS base

RUN apk add --update bash curl

# Install pnpm (Node 26 no longer bundles corepack)
RUN npm install -g pnpm@11.5.2

WORKDIR /service

# Build layer runs root pnpm install and builds the app.
# Note that layers are immutable so node_modules will
# persist in the image even if removed. This is why the
# production stage copies only the files it needs.
FROM base AS build

ARG NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY serve/package.json serve/pnpm-lock.yaml serve/pnpm-workspace.yaml ./serve/

# CI=true makes pnpm default to --frozen-lockfile, including web's postinstall
# that installs serve — keeps the image reproducible without forcing frozen
# installs in local dev. Scoped to this RUN so it doesn't leak into runtime.
RUN --mount=type=cache,target=/root/.local/share/pnpm/store CI=true pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Dev target exposed here for docker compose
FROM build AS dev

EXPOSE 2200

CMD ["pnpm", "start"]

# Production (default) build copies over files
# without node_modules to keep the image small.
FROM base

EXPOSE 2200

COPY --from=build /service/dist ./dist
COPY --from=build /service/serve ./serve
COPY .env .

CMD ["node", "serve/static.js"]
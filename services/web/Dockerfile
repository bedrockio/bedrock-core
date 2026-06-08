# Base layer: runtime essentials shared by the build and production stages.
# pnpm is intentionally NOT installed here so it stays out of the production image.
FROM node:26.3.0-alpine AS base

RUN apk add --update bash curl

WORKDIR /service

# Build layer installs pnpm + dependencies and builds the app. node_modules and
# pnpm live only in this stage; the production stage copies just the built output.
FROM base AS build

# Install pnpm (Node 26 no longer bundles corepack)
RUN npm install -g pnpm@11.5.2

ARG NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY serve/package.json serve/pnpm-lock.yaml serve/pnpm-workspace.yaml ./serve/

# CI=true makes pnpm default to --frozen-lockfile, including web's postinstall
# that installs serve — keeps the image reproducible without forcing frozen
# installs in local dev. Scoped to this RUN so it doesn't leak into runtime.
RUN --mount=type=cache,target=/root/.local/share/pnpm/store --mount=type=cache,target=/root/.cache/pnpm CI=true pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Dev target for docker compose (has pnpm + full deps for the Vite dev server).
FROM build AS dev

EXPOSE 2200

CMD ["pnpm", "start"]

# Production (default) build copies over only the built assets and the static
# server, without pnpm/npm or the app's build-time node_modules.
FROM base

EXPOSE 2200

COPY --from=build /service/dist ./dist
COPY --from=build /service/serve ./serve
COPY .env .

CMD ["node", "serve/static.js"]

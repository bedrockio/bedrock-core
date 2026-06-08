# Build stage: install production dependencies with pnpm.
FROM node:26.3.0-alpine AS deps

# devDependencies (jest, eslint, etc.) are run on the host, not in the image.
ARG NODE_ENV=production

# Install pnpm (Node 26 no longer bundles corepack)
RUN npm install -g pnpm@11.5.2

WORKDIR /service

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store --mount=type=cache,target=/root/.cache/pnpm pnpm install --prod --frozen-lockfile

# Runtime stage: node + production node_modules + source only. No pnpm or npm
# caches, so the image stays small.
FROM node:26.3.0-alpine

# Note layers should be ordered from less to more likely to change.

# Update & install required packages
RUN apk add --update bash curl;

# Needed for Gcloud Storage resumable file uploads
RUN mkdir -p /root/.config

# Set work directory
WORKDIR /service

COPY --from=deps /service/node_modules ./node_modules
COPY . .

# Set your port
ENV PORT=2300

# Expose the port to outside world
EXPOSE 2300

# Start production server
CMD ["node", "src/index.js"]

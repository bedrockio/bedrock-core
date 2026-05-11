// Serves assets with cache control headers and sane defaults.
//
// Mounted at the root so anything with a file extension is treated as a
// candidate static asset (resolved against `dist/`). Vite-hashed bundles
// under `/assets/` are marked immutable; everything else (files copied
// from `public/`) gets a short cache so updates ship without a hashed URL.
// Paths without an extension fall through to the SPA template.

import config from '@bedrockio/config';
import koaStatic from 'koa-static';

const SERVER_SOURCE_MAP_TOKEN = config.get('SERVER_SOURCE_MAP_TOKEN');

const DEBUG_COOKIE_NAME = 'debug';
const HASHED_PREFIX = '/assets/';
const PUBLIC_MAXAGE_MS = 5 * 60 * 1000;
const IMMUTABLE_MAXAGE_MS = 365 * 24 * 60 * 60 * 1000;
const EXT_URL = /\.[a-z0-9]+$/i;

export default function assetsMiddleware(path) {
  const serveHashed = koaStatic(path, {
    index: false,
    maxage: IMMUTABLE_MAXAGE_MS,
    immutable: true,
  });
  const servePublic = koaStatic(path, {
    index: false,
    maxage: PUBLIC_MAXAGE_MS,
  });
  return async (ctx, next) => {
    if (!hasExtension(ctx.path)) {
      return next();
    }
    if (isDisallowed(ctx)) {
      ctx.status = 404;
      return next();
    }
    const isHashed = ctx.path.startsWith(HASHED_PREFIX);
    await (isHashed ? serveHashed : servePublic)(ctx, next);
    if (!canCache(ctx)) {
      ctx.response.set('Cache-Control', 'no-cache');
    }
  };
}

function hasExtension(path) {
  return EXT_URL.test(path);
}

function canCache(ctx) {
  if (ctx.status === 404 && !ctx.response.get('Cache-Control')) {
    // If no asset is found then explicitly pass no-cache to cloudflare.
    // This step is crucial to our rolling deploys as without it freshly
    // rolled out bundles will continue to 404 breaking the entire app.
    return false;
  }
  return !isSourceMap(ctx);
}

function isSourceMap(ctx) {
  return ctx.url.endsWith('.map');
}

function isDisallowed(ctx) {
  if (isSourceMap(ctx) && SERVER_SOURCE_MAP_TOKEN) {
    return ctx.cookies.get(DEBUG_COOKIE_NAME) !== SERVER_SOURCE_MAP_TOKEN;
  }

  return false;
}

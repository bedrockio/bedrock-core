// Serves assets with cache control headers and sane defaults.

import koaStatic from 'koa-static';

export default function assetsMiddleware(path) {
  const serve = koaStatic(path, {
    index: false,
    // koa-static uses koa-send which takes this value in ms
    maxage: 365 * 24 * 60 * 60 * 1000,
    // Static assets always assume a hash in the URL (generated by webpack),
    // so we can safely mark these objects as immutable here.
    immutable: true,
  });
  return async (ctx, next) => {
    await serve(ctx, next);
    if (ctx.status === 404 && !ctx.response.get('Cache-Control')) {
      // If no asset is found then explicitly pass no-cache to cloudflare.
      // This step is crucial to our rolling deploys as without it freshly
      // rolled out bundles will continue to 404 breaking the entire app.
      ctx.response.set('Cache-Control', 'no-cache');
    }
  };
}

// Rewrites URLs for SPAs.
//
// Together with the template middleware this will allow SPAs
// to serve templates for separate apps. It will match against
// the base URLs of known apps and remove anything after. URLs
// without a trailing slash will 301 redirect it appended.
// Subdomains that match apps will also result in a rewrite.
//
// Usage:
//
// app.use(history({ for: ['/', '/admin/'] }))
//
// Examples:
//
// Domain          URL          Status  Result
// ---------------------------------------------
// www.site.com    /            200     /
// www.site.com    /page        200     /
// www.site.com    /admin/      200     /admin/
// www.site.com    /admin/page  200     /admin/
// www.site.com    /admin       301     /admin/
// admin.site.com  /page        200     /admin/
//

const HOT_UPDATE_REG = /__webpack_hmr/;
const EXT_URL = /\.[a-z0-9]+$/i;

function canRewriteUrl(path) {
  return !hasFileExension(path) && !isHotUpdateUrl(path);
}

function hasFileExension(url) {
  return EXT_URL.test(url);
}

function isHotUpdateUrl(url) {
  return HOT_UPDATE_REG.test(url);
}

function matchSubdomainApp(subdomains, apps) {
  if (subdomains.length === 1) {
    const app = `/${subdomains[0]}/`;
    return apps.find((a) => a === app);
  }
  return null;
}

export default function historyMiddleware(opt) {
  const apps = opt.apps;
  // Sort to ensure longer urls are tested first.
  apps.sort((a, b) => b.length - a.length);
  // Match both /app and /app/.
  const tokens = apps.map((app) => {
    return app.length > 1 ? app.replace(/\/$/, '(/|$)') : app;
  });
  const reg = RegExp(`^${tokens.join('|')}`);
  return (ctx, next) => {
    if (canRewriteUrl(ctx.path)) {
      const app = matchSubdomainApp(ctx.subdomains, opt.apps);
      if (app) {
        ctx.url = app;
      } else {
        const match = ctx.url.match(reg);
        if (match) {
          const [base] = match;
          if (base.length > 1 && base.slice(-1) !== '/') {
            ctx.status = 301;
            return ctx.redirect(base + '/');
          } else {
            ctx.url = base;
          }
        }
      }
    }
    return next();
  };
}

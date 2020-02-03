const HOT_UPDATE_REG = /hot-update/;
const EXT_URL = /\.[a-z]+$/i;

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
    return apps.find(a => a === app);
  }
  return null;
}

module.exports = function historyMiddleware(opt) {
  const apps = opt.for;
  apps.sort((a, b) => b.length - a.length);
  const reg = RegExp(`^(${apps.join('|')})`);
  return (ctx, next) => {
    if (canRewriteUrl(ctx.path)) {
      const app = matchSubdomainApp(ctx.subdomains, opt.for);
      if (app) {
        ctx.url = app;
      } else {
        ctx.url.replace(reg, match => {
          ctx.url = match;
        });
      }
    }
    return next();
  };
};

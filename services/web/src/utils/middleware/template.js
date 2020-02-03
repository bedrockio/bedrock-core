const fs = require('fs');
const path = require('path');

const TRAILING_SLASH_REG = /\/$/;

let templateCache;

function loadTemplates(urlPath, cache, opts) {
  fs.readdirSync(path.resolve('dist', urlPath), { withFileTypes: true }).forEach(dirent => {
    if (dirent.isDirectory()) {
      loadTemplates(path.join(urlPath, dirent.name), cache, opts);
      } else if (dirent.isFile() && dirent.name.match(/\.html$/)) {
      loadTemplate(path.join(urlPath, dirent.name), cache, opts);
    }
  });
  return cache;
}

function loadTemplate(templatePath, cache, opts) {
  let urlPath = `/${templatePath.replace(/(index)?.html$/, '')}`;
  if (!isAppEntrypoint(urlPath, opts)) {
    urlPath = urlPath.replace(TRAILING_SLASH_REG, '');
  }
  const template = fs.readFileSync(path.resolve('dist', templatePath), 'utf-8');
  cache[urlPath] = template;
}

function isAppEntrypoint(urlPath, opts) {
  return opts.apps && opts.apps.includes(urlPath);
}

function getTemplate(urlPath) {
  return templateCache[urlPath];
}

function getRedirectUrl(url) {
  const hasTrailingSlash = TRAILING_SLASH_REG.test(url);
  return testUrl(hasTrailingSlash ? url.slice(0, -1) : url + '/');
}

function testUrl(testUrl) {
  return testUrl in templateCache ? testUrl : null;
}

module.exports = function templateMiddleware(opts) {
  templateCache = loadTemplates('', {}, opts);
  return (ctx, next) => {
    let template = getTemplate(ctx.url);
    if (!template) {
      const redirectUrl = getRedirectUrl(ctx.url);
      if (redirectUrl) {
        ctx.status = 301;
        return ctx.redirect(redirectUrl);
      } else {
        // No longer using react-snap for 404 pages, so
        // output the root template insted, but ensure the
        // correct status code is sent.
        ctx.status = 404;
        template = templateCache['/'];
      }
    }
    if (template) {
      ctx.body = template;
    }
    return next();
  };
};

// Serves static templates loaded from the filesystem.
//
// Together with the history middleware this will allow SPAs
// to serve templates for separate apps. If a template is
// requested but not found a 404 will be served using the
// root template.
//
// Usage:
//
// app.use(template({ apps: ['/', '/admin/'] }))
//
// Examples:
//
// URL      Exists  Status  Template
// ----------------------------------------------
// /        yes     200     dist/index.html
// /admin/  yes     200     dist/admin/index.html
// /admin/  no      404     dist/index.html
//

const fs = require('fs');
const path = require('path');

let templateCache;

function loadTemplates(urlPath, cache, opts) {
  fs.readdirSync(path.resolve('dist', urlPath), { withFileTypes: true }).forEach(dirent => {
    if (dirent.isDirectory()) {
      loadTemplates(path.join(urlPath, dirent.name), cache, opts);
    } else if (dirent.isFile() && dirent.name.match(/\.(html|txt|xml)$/)) {
      loadTemplate(path.join(urlPath, dirent.name), cache);
    }
  });
  return cache;
}

function loadTemplate(templatePath, cache) {
  let urlPath = templatePath.replace(/^(.*?)(index.html)?$/, '/$1');
  const template = fs.readFileSync(path.resolve('dist', templatePath), 'utf-8');
  cache[urlPath] = template;
}

function getTemplate(urlPath) {
  return templateCache[urlPath];
}

module.exports = function templateMiddleware(opts) {
  templateCache = loadTemplates('', {}, opts);
  return (ctx, next) => {
    const template = getTemplate(ctx.url);
    if (template) {
      ctx.body = template;
    } else {
      ctx.status = 404;
      ctx.body = templateCache['/'];
    }
    return next();
  };
};

const { template } = require('lodash');

const templateCache = {};

exports.template = (string, options) => {
  let templateFn = templateCache[string];
  if (!templateFn) {
    templateFn = templateCache[string] = template(string, {
      evaluate: /{{([\s\S]+?)}}/g,
      interpolate: /{{=([\s\S]+?)}}/g,
      escape: /\${([\s\S]+?)}/g
    });
  }
  return templateFn(options);
};

exports.sleep = (ms) => {
  return new Promise((r) => setTimeout(r, ms));
};

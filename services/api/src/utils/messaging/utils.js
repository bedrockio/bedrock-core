const fs = require('fs/promises');
const path = require('path');
const Mustache = require('mustache');
const frontmatter = require('front-matter');
const config = require('@bedrockio/config');
const { memoize } = require('lodash');

// Environment vars

const ENV = config.getAll();

// Mustache utils

// Overriding Mustache's HTML escape which
// includes entities for apostrophe/quotes.
Mustache.escape = (text) => text;

function interpolate(body, vars) {
  return Mustache.render(body || '', {
    ...ENV,
    ...vars,
    currentYear: new Date().getFullYear(),
  });
}

// Escape only angle brackets.
function escapeHtml(str) {
  str = str.replace(/</g, '&lt;');
  str = str.replace(/>/g, '&gt;');
  return str;
}

// Templates

const loadTemplate = memoize(
  async (dir, options) => {
    const file = options.file || options.template;
    if (file) {
      const raw = await loadTemplateFile(path.join(dir, file));
      const { body, attributes: meta } = frontmatter(raw);
      return {
        body,
        meta,
      };
    } else {
      return {
        body: '{{&body}}',
        meta: {},
      };
    }
  },
  (dir, options) => {
    const file = options.file || options.template;
    return path.join(dir, file || '');
  }
);

async function loadTemplateFile(file) {
  const ext = path.extname(file);
  if (!ext) {
    try {
      return await loadTemplateFile(file + '.md');
    } catch {
      return await loadTemplateFile(file + '.txt');
    }
  } else {
    const text = await fs.readFile(file, 'utf8');
    return text.trim();
  }
}

module.exports = {
  interpolate,
  loadTemplate,
  escapeHtml,
};

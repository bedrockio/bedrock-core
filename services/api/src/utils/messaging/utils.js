const fs = require('fs/promises');
const path = require('path');
const Mustache = require('mustache');
const frontmatter = require('front-matter');
const { memoize } = require('lodash');

// Environment vars

const ENV = process.env;

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
  async (name, dir) => {
    if (name) {
      const raw = await loadTemplateFile(path.join(dir, name));
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
  (name, dir) => {
    return path.join(dir, name || '');
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

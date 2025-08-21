const path = require('path');
const fs = require('fs/promises');
const Handlebars = require('handlebars');
const frontmatter = require('front-matter');
const config = require('@bedrockio/config');
const { memoize, pick } = require('lodash');
const { getDateTime } = require('../date');
const { getImageUrl, getImageDimensions } = require('../images');
const { Template } = require('../../models');

const TEMPLATE_DIR = path.join(__dirname, '../../templates');

// Environment vars
const ENV = config.getAll();

function getInterpolator(channel) {
  const dir = path.join(TEMPLATE_DIR, channel);
  return async (params) => {
    const result = {};
    const vars = await resolveTemplate({
      ...params,
      channel,
      dir,
    });
    for (let [key, value] of Object.entries(vars)) {
      if (value) {
        value = interpolate(value, params);
      }
      result[key] = value;
    }
    return result;
  };
}

// Templates

async function resolveTemplate(options) {
  let template;

  template ||= await loadTemplateDocument(options);
  template ||= await loadTemplateFile(options);
  template ||= getTemplateParams(options);

  return template;
}

// Note this function is intentionally NOT memoized
// as new templates may be created and must be found.
async function loadTemplateDocument(options) {
  const { template: name, channel } = options;

  if (!name) {
    return;
  }

  const template = await Template.findOne({
    name,
  });

  if (!template) {
    return;
  }

  return processTemplate(template[channel]);
}

const loadTemplateFile = memoize(
  async (options) => {
    const { dir } = options;
    const file = options.file || options.template;
    if (!file) {
      return;
    }

    const raw = await loadFile(path.join(dir, file));
    const { body, attributes: meta } = frontmatter(raw);
    return {
      body,
      ...meta,
    };
  },
  (options) => {
    const { dir, file, template } = options;
    return dir + (file || template);
  },
);

function processTemplate(raw) {
  let fm;
  try {
    fm = frontmatter(raw);
  } catch {
    throw new Error('Syntax Error: Metadata is malformed.');
  }

  const { body, attributes: meta } = fm;

  const hasObject = Object.values(meta).some((value) => {
    return typeof value === 'object';
  });

  if (hasObject) {
    throw new Error('Metadata Error: You likely need to add quotes around brackets.');
  }
  return {
    body,
    ...meta,
  };
}

function getTemplateParams(options) {
  const params = pick(options, ['body', 'subject', 'title', 'image']);
  params.body ||= '{{{body}}}';
  return params;
}

async function loadFile(file) {
  const ext = path.extname(file);
  if (!ext) {
    try {
      return await loadFile(file + '.md');
    } catch {
      return await loadFile(file + '.txt');
    }
  } else {
    const text = await fs.readFile(file, 'utf8');
    return text.trim();
  }
}

// Handlebars

const compile = memoize((str) => {
  return Handlebars.compile(str);
});

Handlebars.registerHelper('image', (arg, options) => {
  const upload = resolveUpload(arg);
  if (!upload) {
    return '';
  }

  const { alt = upload.filename, ...rest } = options.hash;

  const url = getImageUrl(upload, rest);
  const dimensions = getImageDimensions(rest);

  const img = generateHtml('img', {
    src: url,
    alt,
    ...dimensions,
  });

  return new Handlebars.SafeString(`<p>${img}</p>`);
});

Handlebars.registerHelper('imageUrl', (arg, options) => {
  const upload = resolveUpload(arg);

  if (!upload) {
    return '';
  }

  return getImageUrl(upload, options.hash);
});

Handlebars.registerHelper('link', (...args) => {
  const params = resolveParams(args, 'text', 'url');
  return generateHtml('a', {
    ...params,
    target: '_blank',
  });
});

Handlebars.registerHelper('button', (...args) => {
  const params = resolveParams(args, 'text', 'url');
  return generateHtml('a', {
    ...params,
    class: 'button',
    target: '_blank',
  });
});

Handlebars.registerHelper('date', (arg) => {
  return getDateTime(arg).formatDate();
});

Handlebars.registerHelper('time', (arg) => {
  return getDateTime(arg).formatTime();
});

Handlebars.registerHelper('rtime', (arg) => {
  return getDateTime(arg).relative();
});

Handlebars.registerHelper('number', (arg) => {
  const { index } = arg.data;
  if (index == null) {
    return '';
  }
  return index + 1;
});

// Allow fallback to default values.
Handlebars.registerHelper('helperMissing', (value) => {
  return typeof value === 'string' ? value : '';
});

// Helper utils

function resolveParams(args, ...names) {
  const ordered = args.slice(0, -1);
  const [options] = args.slice(-1);
  let params = { ...options.hash };
  ordered.forEach((value, i) => {
    const name = names[i];
    params[name] = value;
  });

  params = normalizeParams(params);

  return params;
}

function normalizeParams(params) {
  const result = {};
  for (let [key, value] of Object.entries(params)) {
    if (key === 'url') {
      key = 'href';
      value = normalizeUrl(value, result);
    }
    result[key] = value;
  }
  return result;
}

const PARAM_REG = /:([a-z]+)/gi;

function normalizeUrl(str, params) {
  if (str.startsWith('/')) {
    str = `${ENV['APP_URL']}${str}`;
  }

  str = str.replace(PARAM_REG, (_, key) => {
    const value = params[key];
    // Need to delete the injected params or they
    // will be passed on to the HTML element.
    delete params[key];
    return value;
  });

  return str;
}

function resolveUpload(arg) {
  if (Array.isArray(arg)) {
    return arg[0];
  }
  return arg;
}

function generateHtml(tag, props) {
  const { text, ...rest } = props;
  const attr = Object.entries(rest)
    .map((entry) => {
      const [key, value] = entry;
      if (value) {
        return [key, `"${value}"`].join('=');
      }
    })
    .filter((a) => a)
    .join(' ');

  let html = `<${tag} ${attr}>`;
  if (text) {
    html += `${text}</${tag}>`;
  }
  return new Handlebars.SafeString(html);
}

function interpolate(str, params) {
  if (!str) {
    return '';
  }

  params = {
    ...ENV,
    ...params,
    currentYear: new Date().getFullYear(),
  };

  const fn = compile(str);

  try {
    let result = fn(params, {
      allowProtoPropertiesByDefault: true,
    });
    result = unescapeHtml(result);
    return result;
  } catch (err) {
    if (err.message.includes('.call is not a function')) {
      throw new Error('Syntax Error: You likely tried to call a non-function as a function.');
    } else {
      throw err;
    }
  }
}

// Handlebars doesn't allow a way to selectively
// escape so instead unescape some basic tokens.
function unescapeHtml(html) {
  html = html.replace(/&#39;/g, "'");
  html = html.replace(/&quot;/g, '"');
  html = html.replace(/&#x27;/g, "'");
  html = html.replace(/&#x3D;/g, '=');
  return html;
}

module.exports = {
  getInterpolator,
};

const postmark = require('postmark');
const marked = require('marked');
const Mustache = require('mustache');
const frontmatter = require('front-matter');
const { memoize, camelCase } = require('lodash');
const fs = require('fs').promises;
const path = require('path');

const config = require('@bedrockio/config');
const { logger } = require('@bedrockio/instrumentation');

const ENV = config.getAll();
const { ENV_NAME, POSTMARK_FROM, POSTMARK_API_KEY, POSTMARK_DEV_TO } = ENV;

const VARS = getVars(ENV);

async function sendTemplatedMail({ file, template, layout = 'layout.html', to, ...options }) {
  const { body: templateBody, meta: templateMeta } = await loadTemplate(template, file);
  const layoutBody = await loadTemplateFile(layout);

  if (!templateBody) {
    logger.error(`Could not load template ${template}.`);
    return;
  }

  const vars = {
    ...VARS,
    ...templateMeta,
    ...options,
    currentYear: new Date().getFullYear(),
  };

  // Interpolate variables within the template body then convert
  // to html to be injected into the layout.
  let body = templateBody;
  body = interpolate(body, vars);
  body = marked(body);

  const html = interpolate(layoutBody, {
    ...vars,
    content: body,
  });

  const text = await loadPlainText(file, body);
  const subject = interpolate(vars.subject, vars);

  if (!to && options.user) {
    const { user } = options;
    to = `"${user.name || 'User'}" <${user.email}>`;
  }

  if (ENV_NAME === 'development' && !POSTMARK_DEV_TO) {
    logger.debug(`Sending email to ${to}`);
    logger.debug(`Subject: ${subject}`);
    logger.debug('Body:');
    logger.debug(body);
    logger.debug(vars);
  } else {
    logger.debug(`Sending postmark email to ${to}`);
    await sendMail({
      to,
      html,
      text,
      subject,
    });
  }
}

async function sendMail({ to, html, text, subject }) {
  try {
    if (ENV_NAME === 'development') {
      to = POSTMARK_DEV_TO;
    }
    const client = new postmark.ServerClient(POSTMARK_API_KEY);
    await client.sendEmail({
      From: POSTMARK_FROM,
      To: to,
      Subject: subject,
      TextBody: text,
      HtmlBody: html,
    });
  } catch (error) {
    logger.error(`Error happened while sending email to ${to} (${error.message})`);
    logger.error(error);
  }
}

// Marked config

marked.use({
  walkTokens: (token) => {
    if (token.type === 'paragraph') {
      const tokens = token.tokens || [];
      if (tokens.length === 1 && tokens[0].type === 'strong') {
        const strong = tokens[0];
        const strongTokens = strong.tokens || [];
        if (strongTokens.length === 1 && strongTokens[0].type === 'link') {
          const link = strongTokens[0];
          link.title = '$button$';
        }
      }
    }
  },

  renderer: {
    link(href, title, text) {
      if (title === '$button$') {
        return `<a href="${href}" class="button" target="_blank"><span class="text">${text}</span></a>`;
      } else if (href.includes('{{')) {
        // Links may include template interpolation which
        // gets escaped so output it unescaped here.
        return `<a href="${href}">${text}</a>`;
      }
      return false;
    },
  },
});

// Mustache utils

// Mustache is HTML escaping URLs by default
// which causes issues so avoid this.
const escapeHtml = Mustache.escape;
Mustache.escape = (text) => {
  if (!text.match(/https?:\/\//)) {
    text = escapeHtml(text);
  }
  return text;
};

function interpolate(body, vars) {
  if (body) {
    return Mustache.render(body, vars);
  } else {
    return '';
  }
}

// Templates

const templatesDist = path.join(__dirname, '../emails');

const loadTemplateFile = memoize(async (file) => {
  try {
    return await fs.readFile(path.join(templatesDist, file), 'utf8');
  } catch (error) {
    return '';
  }
});

async function loadTemplate(template, file) {
  const raw = await getTemplateRaw(template, file);
  if (!raw) {
    throw new Error('"template" or "file" required.');
  }
  const { body, attributes: meta } = frontmatter(raw);
  return { body, meta };
}

async function getTemplateRaw(template, file) {
  if (template) {
    return template;
  } else if (file) {
    return await loadTemplateFile(file);
  } else {
    throw new Error('Either "template" or "file" required.');
  }
}

async function loadPlainText(file, html, vars) {
  const raw = file && (await loadTemplateFile(file.replace(/\.md$/, '.txt')));
  if (raw) {
    return interpolate(raw, vars);
  } else {
    return htmlToText(html);
  }
}

// Vars

function getVars(env) {
  // Allow env vars to also be referenced by camel case
  // as snake casing will cause issues in markdown.
  const vars = { ...env };
  for (let [key, val] of Object.entries(vars)) {
    vars[camelCase(key)] = val;
  }
  return vars;
}

// Misc

const TAG_REG = /<[^>]*>?/gm;
const LINK_REG = /<a href="(.+?)"[^>]*>(.+)<\/a>/gm;
const ENTITY_REG = /&#(\d+);/gm;

// Remove html tags while preserving links for plaintext.
function htmlToText(str) {
  str = str.replace(LINK_REG, '$2 ($1)');
  str = str.replace(TAG_REG, '');
  str = str.replace(ENTITY_REG, (all, dec) => {
    return String.fromCodePoint(dec);
  });
  return str;
}

module.exports = {
  sendTemplatedMail,
};

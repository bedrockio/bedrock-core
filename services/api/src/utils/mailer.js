const postmark = require('postmark');
const marked = require('marked');
const Mustache = require('mustache');
const { memoize } = require('lodash');
const fm = require('front-matter');
const fs = require('fs').promises;
const path = require('path');

const config = require('@bedrockio/config');
const { logger } = require('@bedrockio/instrumentation');

const ENV = config.getAll();

const { ENV_NAME, POSTMARK_FROM, POSTMARK_API_KEY, POSTMARK_DEV_TO } = ENV;

async function sendTemplatedMail({ template, layout = 'layout.html', to, ...options }) {
  const textTemplate = template.replace(/\.md$/, '.txt');
  let [
    { body: layoutBody, meta: layoutMeta },
    { body: templateBody, meta: templateMeta },
    { body: textBody, meta: textMeta },
  ] = await Promise.all([fetchTemplate(layout), fetchTemplate(template), fetchTemplate(textTemplate)]);

  if (!templateBody) {
    logger.error(`Could not load template ${template}.`);
    return;
  }

  const vars = {
    ...ENV,
    ...layoutMeta,
    ...textMeta,
    ...templateMeta,
    ...options,
  };

  // Two pass interpolation here allows the passed content body
  // to also contain variables so that dynamic contenet can work.
  let body = templateBody;
  body = interpolate(body, vars);
  body = interpolate(body, vars);
  body = marked(body);

  const html = interpolate(layoutBody, {
    ...vars,
    content: body,
  });

  if (!textBody) {
    textBody = htmlToText(body);
  }

  const text = interpolate(textBody, vars);
  const subject = interpolate(vars.subject, vars);

  if (!to && options.user) {
    const { user } = options;
    to = `"${user.name || 'User'}" <${user.email}>`;
  }

  if (ENV_NAME === 'test') {
    logger.debug(`Sending email to ${to}`);
  } else if (ENV_NAME === 'development' && !POSTMARK_DEV_TO) {
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

const fetchTemplate = memoize(async (file) => {
  try {
    const str = await fs.readFile(path.join(templatesDist, file), 'utf8');
    let { body, attributes } = fm(str);
    return {
      body,
      meta: {
        ...attributes,
        currentYear: new Date().getFullYear(),
      },
    };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return '';
    }
    throw err;
  }
});

// Misc

const LINK_REG = /<a href="(.+?)"[^>]*>(.+)<\/a>/gm;

// Remove html tags while preserving links for plaintext.
function htmlToText(str) {
  str = str.replace(LINK_REG, '$2 ($1)');
  str = str.replace(/<[^>]*>?/gm, '');
  return str;
}

module.exports = {
  sendTemplatedMail,
};

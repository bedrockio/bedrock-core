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

const { ENV_NAME, POSTMARK_FROM, POSTMARK_API_KEY, POSTMARK_SEND_DEV } = ENV;

async function sendTemplatedMail({ template, layout = 'layout.html', to, ...options }) {
  const textTemplate = template.replace(/\.md$/, '.txt');
  let [
    { body: layoutBody, meta: layoutMeta },
    { body: templateBody, meta: templateMeta },
    { body: textBody, meta: textMeta },
  ] = await Promise.all([fetchTemplate(layout), fetchTemplate(template), fetchTemplate(textTemplate)]);

  if (!templateBody && !textBody) {
    logger.error(`Could not load template ${template}.`);
    return;
  }

  options = {
    ...ENV,
    ...layoutMeta,
    ...textMeta,
    ...templateMeta,
    ...options,
  };

  const body = render(templateBody, options);

  const html = render(layoutBody, {
    ...options,
    content: body,
  });

  if (!textBody) {
    textBody = htmlToText(body);
  }

  const text = render(textBody, options);
  const subject = render(options.subject, options);

  if (!to && options.user) {
    const { user } = options;
    to = `"${user.name}" <${user.email}>`;
  }

  await sendMail({
    to,
    text,
    html,
    body,
    subject,
    options,
  });
}

async function sendMail({ to, subject, html, text, body, options }) {
  if (canSendMail()) {
    try {
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
  } else {
    if (ENV_NAME === 'test') {
      logger.debug(`Sending email to ${to}`);
    } else {
      logger.debug(`Sending email to ${to}`);
      logger.debug(`Subject: ${subject}`);
      logger.debug('Body:');
      logger.debug(body);
      logger.debug(options);
    }
  }
}

function canSendMail() {
  if (ENV_NAME === 'test') {
    return false;
  } else if (ENV_NAME === 'development') {
    return POSTMARK_API_KEY && POSTMARK_SEND_DEV;
  } else {
    return POSTMARK_API_KEY;
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

function render(body, options) {
  if (body) {
    return Mustache.render(body, options);
  } else {
    return '';
  }
}

// Templates

const templatesDist = path.join(__dirname, '../../emails');

const fetchTemplate = memoize(async (file) => {
  try {
    const str = await fs.readFile(path.join(templatesDist, file), 'utf8');
    let { body, attributes: meta } = fm(str);
    if (file.endsWith('.md')) {
      body = marked(body);
    }
    return {
      body,
      meta,
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

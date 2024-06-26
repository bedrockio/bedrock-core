const path = require('path');
const postmark = require('postmark');
const marked = require('marked');
const htmlToText = require('html-to-text');

const { loadTemplate, interpolate, escapeHtml } = require('./utils');

const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');

const ENV_NAME = config.get('ENV_NAME');
const APP_NAME = config.get('APP_NAME');
const POSTMARK_FROM = config.get('POSTMARK_FROM');
const POSTMARK_API_KEY = config.get('POSTMARK_API_KEY');
const POSTMARK_DEV_EMAIL = config.get('POSTMARK_DEV_EMAIL');
const POSTMARK_WEBHOOK_KEY = config.get('POSTMARK_WEBHOOK_KEY');

const TEMPLATE_DIR = path.join(__dirname, '../../templates/emails');

const DEFAULT_LAYOUT = 'layout.html';

async function sendMail(options) {
  let { layout = DEFAULT_LAYOUT, ...params } = options;

  const email = getAddresses(options);

  const { body: templateBody, meta: templateMeta } = await loadTemplate(TEMPLATE_DIR, options);
  const { body: layoutBody } = await loadTemplate(TEMPLATE_DIR, {
    file: layout,
  });

  params = {
    ...templateMeta,
    ...params,
  };

  // Variables must be interpolated, then parsed as
  // markdown, then interpolated again into the layout.
  let body = templateBody;
  body = escapeHtml(interpolate(body, params));

  let html = marked.parse(body).trim();
  html = interpolate(layoutBody, {
    ...params,
    content: html,
  });

  const text = await convertHtml(html);
  const subject = interpolate(templateMeta.subject || '{{subject}}', params);

  await dispatchMail({
    email,
    html,
    text,
    body,
    subject,
    template: params.template,
  });
}

async function dispatchMail(options) {
  let { email, subject, html, text, body, template } = options;
  if (ENV_NAME === 'development') {
    if (POSTMARK_DEV_EMAIL) {
      email = POSTMARK_DEV_EMAIL;
    } else {
      logger.info(`
  ---------- Email Sent -------------
  To: ${email}
  Body:
  ${text}
  --------------------------
                `);
    }
    return;
  }

  logger.debug(`Sending email to ${email}`);

  try {
    const client = new postmark.ServerClient(POSTMARK_API_KEY);
    await client.sendEmail({
      From: `${APP_NAME} <${POSTMARK_FROM}>`,
      To: email,
      Subject: subject,
      TextBody: text,
      HtmlBody: html,
      template,
      body,
    });
  } catch (error) {
    logger.error(`Error happened while sending email to ${email} (${error.message})`);
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

function getAddresses(options) {
  let { email, user, users = [] } = options;

  if (email) {
    return email;
  }

  if (user) {
    users = [user];
  }
  if (!users.length) {
    throw new Error('No addresses to send to.');
  }
  return users
    .map((user) => {
      return `${user.name} <${user.email}>`;
    })
    .join(',');
}

// Remove html tags while preserving links for plaintext.
function convertHtml(str) {
  return htmlToText.convert(str, {
    selectors: [
      {
        selector: 'a',
        options: {
          hideLinkHrefIfSameAsText: true,
          linkBrackets: ['(', ')'],
        },
      },
    ],
  });
}

function validateWebhookKey(ctx) {
  const key = ctx.request.get('x-pm-webhook-key');
  if (key !== POSTMARK_WEBHOOK_KEY) {
    logger.warn(`Bad webhook key "${key}".`);
    logger.warn(`Configured key is ${POSTMARK_WEBHOOK_KEY}`);
    throw new Error('Invalid Postmark webhook key.');
  }
}

module.exports = {
  sendMail,
  validateWebhookKey,
};

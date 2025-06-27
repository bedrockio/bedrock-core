const marked = require('marked');
const postmark = require('postmark');
const htmlToText = require('html-to-text');
const { omit } = require('lodash');

const { getInterpolator } = require('./utils');

const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');

const ENV_NAME = config.get('ENV_NAME');
const APP_NAME = config.get('APP_NAME');
const POSTMARK_FROM = config.get('POSTMARK_FROM');
const POSTMARK_API_KEY = config.get('POSTMARK_API_KEY');
const POSTMARK_DEV_EMAIL = config.get('POSTMARK_DEV_EMAIL');
const POSTMARK_WEBHOOK_KEY = config.get('POSTMARK_WEBHOOK_KEY');

const DEFAULT_LAYOUT = 'layout.html';

const interpolate = getInterpolator('email');

async function sendMail(options) {
  const params = await getMailParams(options);
  await dispatchMail(params);
}

async function getMailParams(options) {
  let { layout = DEFAULT_LAYOUT, cc, bcc, ...params } = options;

  const email = getAddresses(options);
  const template = params.template || params.file;

  // First interpolate variables into the template.
  const { body, subject } = await interpolate(params);

  // Next parse as markdown and convert to html.
  const content = marked.parse(body).trim();

  const { body: html } = await interpolate({
    ...omit(params, 'template'),
    file: layout,
    content,
  });

  const text = stripHtml(html);

  return {
    email,
    html,
    text,
    body,
    subject,
    template,
    cc,
    bcc,
  };
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
      return;
    }
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
      ...resolveCopies(options),
    });
  } catch (error) {
    logger.error(`Error happened while sending email to ${email} (${error.message})`);
    logger.error(error);
  }
}

function resolveCopies(options) {
  return {
    Cc: resolveCopyArray(options.cc),
    Bcc: resolveCopyArray(options.bcc),
  };
}

function resolveCopyArray(arg) {
  if (Array.isArray(arg)) {
    return arg.join(', ');
  }
  return arg;
}

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
function stripHtml(str) {
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
  getMailParams,
  validateWebhookKey,
};

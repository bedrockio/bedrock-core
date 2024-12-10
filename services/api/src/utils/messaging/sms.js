const path = require('path');
const twilio = require('twilio');
const logger = require('@bedrockio/logger');

const { interpolate, loadTemplate } = require('./utils');

const { API_URL, ENV_NAME, AUTH_TOKEN, ACCOUNT_SID, TEST_NUMBER, FROM_NUMBER, WEBHOOK_URL } = process.env;

const TEMPLATE_DIR = path.join(__dirname, '../../sms');

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

async function sendMessage(options) {
  let { to, user, template, ...params } = options;

  to ||= user?.phone;

  if (!to) {
    throw new Error('No phone number specified.');
  }

  const { body: templateBody } = await loadTemplate(template, TEMPLATE_DIR);

  const body = interpolate(templateBody, params);

  if (ENV_NAME === 'development') {
    if (TEST_NUMBER) {
      to = TEST_NUMBER;
    } else {
      logger.info(`

---------- SMS Sent -------------
To: ${to}
Body: ${body}
--------------------------

      `);
      return;
    }
  }

  logger.debug(`Sending SMS to ${to}`);

  await client.messages.create({
    ...options,
    from: FROM_NUMBER,
    to,
    body,
  });
}

// Allows a tunnel to be set up to test incoming webhooks.
// This is only needed on development, otherwise this should
// always be the same as API_URL. Note that even in GCP
// environments this should use API_URL as the service may
// be behind a reverse proxy.
function getWebhookUrl(url) {
  let origin;
  if (ENV_NAME === 'development') {
    origin = WEBHOOK_URL || API_URL;
  } else {
    origin = API_URL;
  }
  return `${origin}${url}`;
}

// Note: All webhooks are signed with the PRIMARY auth token
// of the twilio account (secondary token cannot be used)
function validateSignature(ctx) {
  const url = getWebhookUrl(ctx.url);
  const body = ctx.request.body;
  const signature = ctx.get('X-Twilio-Signature');

  logger.info('Incoming webhook');
  logger.info(`Webhook url ${url}`);
  logger.info(`Webhook header ${signature}`);
  logger.info(`Webhook auth token ${AUTH_TOKEN}`);

  if (!twilio.validateRequest(AUTH_TOKEN, signature, url, body)) {
    ctx.throw(400, 'Invalid Message Signature');
  }
}

module.exports = {
  sendMessage,
  getWebhookUrl,
  validateSignature,
};

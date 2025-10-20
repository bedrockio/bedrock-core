const twilio = require('twilio');
const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');

const { UnsubscribedError } = require('./errors');

const { renderTemplate } = require('../templates');

const API_URL = config.get('API_URL');
const ENV_NAME = config.get('ENV_NAME');

const AUTH_TOKEN = config.get('TWILIO_AUTH_TOKEN');
const ACCOUNT_SID = config.get('TWILIO_ACCOUNT_SID');
const TEST_NUMBER = config.get('TWILIO_TEST_NUMBER');
const FROM_NUMBER = config.get('TWILIO_FROM_NUMBER');
const WEBHOOK_URL = config.get('TWILIO_WEBHOOK_URL');

const client = getClient();

async function sendSms(options) {
  let { phone, ...params } = options;

  phone ||= params.user?.phone;

  if (!phone) {
    throw new Error('No phone number specified.');
  }

  const { body } = await renderTemplate({
    channel: 'sms',
    ...params,
  });

  if (ENV_NAME === 'development') {
    if (TEST_NUMBER) {
      phone = TEST_NUMBER;
    } else {
      logger.info(`

---------- SMS Sent -------------
To: ${phone}
Body: ${body}
--------------------------

      `);
      return;
    }
  }

  logger.debug(`Sending SMS to ${phone}`);

  try {
    await client.messages.create({
      body,
      to: phone,
      from: FROM_NUMBER,
      template: params.template,
    });
  } catch (error) {
    if (error.code === 21610) {
      throw new UnsubscribedError();
    } else {
      throw error;
    }
  }
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

function getClient() {
  if (ACCOUNT_SID && AUTH_TOKEN) {
    return twilio(ACCOUNT_SID, AUTH_TOKEN);
  }
}

module.exports = {
  sendSms,
  getWebhookUrl,
  validateSignature,
};

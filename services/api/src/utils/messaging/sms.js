import twilio from 'twilio';
import config from '@bedrockio/config';
import logger from '@bedrockio/logger';

import { UnsubscribedError, TwilioError } from './errors.js';

import { renderTemplate } from '../templates.js';

const ENV_NAME = config.get('ENV_NAME');

const AUTH_TOKEN = config.get('TWILIO_AUTH_TOKEN');
const ACCOUNT_SID = config.get('TWILIO_ACCOUNT_SID');
const TEST_NUMBER = config.get('TWILIO_TEST_NUMBER');
const FROM_NUMBER = config.get('TWILIO_FROM_NUMBER');

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
      throw new TwilioError(error);
    }
  }
}

function getClient() {
  if (ACCOUNT_SID || ENV_NAME === 'test') {
    return twilio(ACCOUNT_SID, AUTH_TOKEN);
  }
}

export { sendSms };

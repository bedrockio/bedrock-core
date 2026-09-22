import crypto from 'crypto';
import config from '@bedrockio/config';

const { default: twilio } = await vi.importActual('twilio');

const API_URL = config.get('API_URL');
const AUTH_TOKEN = config.get('TWILIO_AUTH_TOKEN');

let sentMessages;
let unsubscribed;

beforeEach(() => {
  sentMessages = [];
  unsubscribed = [];
});

async function sendMessage(options) {
  const { to } = options;
  if (!to) {
    throw new Error('No phone number.');
  } else if (unsubscribed.includes(to)) {
    const error = new Error('Attempt to send to unsubscribed recipient');
    error.code = 21610;
    throw error;
  }
  sentMessages.push({
    ...options,
    phone: options.to,
  });
}

function assertSmsSent(options) {
  const { body, ...rest } = options;
  expect(sentMessages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        ...rest,
        ...(body && {
          body: expect.stringContaining(body),
        }),
      }),
    ]),
  );
}

function assertSmsCount(count) {
  expect(sentMessages.length).toBe(count);
}

function getSentSms(options) {
  return sentMessages.find((sms) => {
    return Object.keys(options).some((key) => {
      return sms[key] === options[key];
    });
  });
}

function createClient() {
  return {
    messages: {
      create: sendMessage,
    },
  };
}

function signRequest(path, params) {
  const url = API_URL + path;
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  return crypto.createHmac('sha1', AUTH_TOKEN).update(Buffer.from(data, 'utf-8')).digest('base64');
}

function setTwilioUnsubscribed(phone) {
  unsubscribed.push(phone);
}

Object.assign(createClient, twilio);

export { signRequest, getSentSms, assertSmsSent, assertSmsCount, setTwilioUnsubscribed };

export default createClient;

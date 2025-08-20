const crypto = require('crypto');
const config = require('@bedrockio/config');
const twilio = jest.requireActual('twilio');

const AUTH_TOKEN = config.get('TWILIO_AUTH_TOKEN');

let sentMessages;
let createdRooms;
let unsubscribed;

beforeEach(() => {
  sentMessages = [];
  createdRooms = [];
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

function assertRoomCreated(roomName) {
  expect(createdRooms).toContain(roomName);
}

function getSentSms(options) {
  return sentMessages.find((sms) => {
    return Object.keys(options).some((key) => {
      return sms[key] === options[key];
    });
  });
}

function rooms(roomName) {
  return {
    async fetch() {
      if (!createdRooms.includes(roomName)) {
        const error = new Error('No room created.');
        error.code = 20404;
        throw error;
      }
    },

    participants: {
      async list() {
        return [];
      },
    },
  };
}

rooms.create = createRoom;

async function createRoom(options) {
  const { uniqueName } = options;
  createdRooms.push(uniqueName);
}

function createClient() {
  return {
    video: {
      v1: {
        rooms,
      },
    },
    messages: {
      create: sendMessage,
    },
  };
}

function signRequest(path, params) {
  const { getWebhookUrl } = require('../src/utils/messaging/sms');
  const url = getWebhookUrl(path);
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + params[key], url);

  return crypto.createHmac('sha1', AUTH_TOKEN).update(Buffer.from(data, 'utf-8')).digest('base64');
}

function setTwilioUnsubscribed(phone) {
  unsubscribed.push(phone);
}

Object.assign(createClient, {
  ...twilio,
  signRequest,
  getSentSms,
  assertSmsSent,
  assertSmsCount,
  assertRoomCreated,
  setTwilioUnsubscribed,
});

module.exports = createClient;

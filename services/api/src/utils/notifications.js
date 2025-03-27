const config = require('@bedrockio/config');
const { sendMail, sendSms, sendPush } = require('./messaging');
const { createMailToken } = require('./auth/tokens');
const types = require('../lib/notifications/types');
const { User } = require('../models');

const API_URL = config.get('API_URL');

async function sendNotification(options = {}) {
  assertOptions(options);
  const { type, user } = options;

  const base = getBase(options);
  const userConfig = getUserConfig(options);

  const config = {
    ...base,
    ...userConfig?.toObject(),
  };

  if (config.email) {
    await sendMail({
      ...options,
      unsubscribeUrl: getUnsubscribeUrl(options),
    });
  }
  if (config.sms) {
    await sendSms(options);
  }
  if (config.push) {
    await sendPush(options);
  }

  if (!userConfig) {
    user.notifications.push({
      name: type,
      ...base,
    });
    await user.save();
  }

  await User.updateOne(
    {
      _id: user.id,
      'notifications.name': type,
    },
    {
      $inc: {
        'notifications.$.sent': 1,
      },
      $set: {
        'notifications.$.lastSentAt': new Date(),
      },
    },
  );
}

async function unsubscribe(options) {
  assertOptions(options);
  const { user, type, channel } = options;

  for (let notification of user.notifications) {
    if (notification.name === type) {
      if (hasChannel(channel, 'email')) {
        notification.email = false;
      }
      if (hasChannel(channel, 'push')) {
        notification.push = false;
      }
      if (hasChannel(channel, 'sms')) {
        notification.sms = false;
      }
    }
  }
  user.markModified('notifications');
  await user.save();
}

function hasChannel(channel, name) {
  return channel === name || channel === 'all';
}

function assertOptions(options) {
  const { type, user } = options;
  if (!type) {
    throw new Error('Type required');
  } else if (!user) {
    throw new Error('User required');
  }
}

function getBase(options) {
  const { type } = options;
  return types.find((t) => {
    return t.name === type;
  });
}

function getUserConfig(options) {
  const { user, type } = options;
  return user.notifications.find((n) => {
    return n.name === type;
  });
}

function getUnsubscribeUrl(options) {
  const { type, user } = options;
  const token = createMailToken(user);

  const url = new URL('/1/notifications/unsubscribe', API_URL);
  url.searchParams.set('type', type);
  url.searchParams.set('token', token);
  url.searchParams.set('channel', 'email');
  return url.toString();
}

module.exports = {
  sendNotification,
  unsubscribe,
};

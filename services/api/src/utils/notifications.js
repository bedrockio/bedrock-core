const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');
const { sendMail, sendSms, sendPush } = require('./messaging');
const { UnsubscribedError } = require('./messaging/errors');
const { createAccessToken } = require('./tokens');
const types = require('../lib/notifications/types');
const { User } = require('../models');

const APP_URL = config.get('APP_URL');

async function sendNotification(options = {}) {
  assertOptions(options);
  const { name, user } = options;

  const base = getBase(options);
  const userConfig = getUserConfig(options);

  const config = {
    ...base,
    ...userConfig?.toObject(),
  };

  if (!userConfig) {
    user.notifications.push({
      name,
      ...base,
    });
    await user.save();
  }

  let sent = 0;

  if (config.sms) {
    sent += await attemptSend('sms', options);
  }
  if (config.push) {
    sent += await attemptSend('push', options);
  }
  if (config.email) {
    sent += await attemptSend('email', options);
  }

  if (sent > 0) {
    await User.updateOne(
      {
        _id: user.id,
        'notifications.name': name,
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
  } else {
    logger.debug(`Notification "${name}" not sent to ${user.id}.`);
  }
}

function assertOptions(options) {
  const { name, user } = options;
  if (!name) {
    throw new Error('Name required');
  } else if (!user) {
    throw new Error('User required');
  }
}

function getBase(options) {
  const { name } = options;
  return types.find((t) => {
    return t.name === name;
  });
}

function getUserConfig(options) {
  const { name, user } = options;
  return user.notifications.find((n) => {
    return n.name === name;
  });
}

async function attemptSend(channel, options) {
  const { user } = options;
  try {
    if (channel === 'sms') {
      await sendSms(options);
    } else if (channel === 'push') {
      await sendPush(options);
    } else if (channel === 'email') {
      await sendMail({
        ...options,
        unsubscribeUrl: getUnsubscribeUrl(options),
      });
    }
    return 1;
  } catch (error) {
    if (error instanceof UnsubscribedError) {
      logger.debug(`User ${user.id} unsubscribed.`);
      await disableNotificationsForChannel(user, channel);
      return 0;
    } else {
      throw error;
    }
  }
}

// Disable all notification for given channel.
async function disableNotificationsForChannel(user, channel) {
  await User.updateOne(
    {
      _id: user.id,
      [`notifications.${channel}`]: true,
    },
    {
      $set: {
        [`notifications.$[].${channel}`]: false,
      },
    },
  );
}

// Unsubscribe

async function unsubscribe(options) {
  assertOptions(options);
  const { user, name, channel } = options;

  for (let notification of user.notifications) {
    if (notification.name === name) {
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

function getUnsubscribeUrl(options) {
  const { name, user } = options;

  const token = createAccessToken(user, {
    name,
    action: 'unsubscribe',
    channel: 'email',
  });

  const url = new URL('/unsubscribe', APP_URL);
  url.searchParams.set('token', token);
  return url.toString();
}

module.exports = {
  sendNotification,
  unsubscribe,
};

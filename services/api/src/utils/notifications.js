const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');
const { sendMail, sendSms, sendPush } = require('./messaging');
const { UnsubscribedError } = require('./messaging/errors');
const { createAccessToken } = require('./tokens');
const { getDateTime } = require('./date');
const { Notification } = require('../models');
const { resolveTemplate } = require('./templates');

const APP_URL = config.get('APP_URL');

async function scheduleNotification(options) {
  const { offset, ...attributes } = options;

  const template = await resolveTemplate(options);

  if (!template) {
    throw new Error(`Could not find template ${options.template}.`);
  }

  let runAt = getDateTime();

  if (offset) {
    runAt = runAt.advance(offset);
  }

  await Notification.create({
    ...attributes,
    template,
    runAt,
  });
}

async function cancelNotification(options) {
  const { user } = options;
  if (!user) {
    throw new Error('User required.');
  }

  const template = await resolveTemplate(options);

  if (!template) {
    throw new Error('Template required.');
  }

  const notifications = await Notification.find({
    user,
    template,
  });

  for (let notification of notifications) {
    notification.status = 'canceled';
    await notification.save();
  }
}

async function sendNotifications() {
  const now = new Date();

  const notifications = await Notification.find({
    status: 'pending',
    runAt: {
      $lte: now,
    },
  });

  for (let notification of notifications) {
    try {
      await sendNotification(notification);
    } catch (error) {
      logger.error(error);
    }
  }
}

async function sendNotification(notification) {
  await notification.include(['user', 'template']);

  const config = await ensureUserConfig(notification);

  const { type, user, template } = notification;
  const { channels } = template;

  let sent = false;

  for (let channel of channels) {
    if (config[channel] === false) {
      continue;
    }

    const success = await attemptSend(channel, {
      template,
      user,
      type,
    });

    sent ||= success;
  }

  if (sent) {
    config.lastSentAt = new Date();
  }

  await user.save();

  notification.status = 'completed';
  await notification.save();
}

async function ensureUserConfig(notification) {
  const { user, type } = notification;
  let config = getUserConfig(user, type);

  if (!config) {
    user.notifications.push({
      type,
    });

    config = getUserConfig(user, type);
  }

  return config;
}

function getUserConfig(user, type) {
  return user.notifications.find((n) => {
    return n.type === type;
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
    return true;
  } catch (error) {
    if (error instanceof UnsubscribedError) {
      logger.debug(`User ${user.id} unsubscribed.`);
      disableNotificationsForChannel(user, channel);
      return false;
    } else {
      throw error;
    }
  }
}

// Disable all notification for given channel.
function disableNotificationsForChannel(user, channel) {
  for (let setting of user.notifications) {
    setting[channel] = false;
  }
}

// Unsubscribe

async function unsubscribe(options) {
  const { user, type, channel } = options;

  for (let notification of user.notifications) {
    if (notification.type === type) {
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
  await user.save();
}

function hasChannel(channel, target) {
  return channel === target || channel === 'all';
}

function getUnsubscribeUrl(options) {
  const { type, user } = options;

  const token = createAccessToken(user, {
    type,
    action: 'unsubscribe',
    channel: 'email',
  });

  const url = new URL('/unsubscribe', APP_URL);
  url.searchParams.set('token', token);
  return url.toString();
}

module.exports = {
  sendNotifications,
  scheduleNotification,
  cancelNotification,
  unsubscribe,
};

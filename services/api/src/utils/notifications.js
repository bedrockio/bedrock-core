const { sendMail, sendSms, sendPush } = require('./messaging');
const types = require('../lib/notifications/types');
const { User } = require('../models');

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
    await sendMail(options);
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

module.exports = {
  sendNotification,
};

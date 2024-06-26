const { sendMail, sendSms, sendPush } = require('./messaging');

async function sendNotification(options = {}) {
  let { name, user, ...rest } = options;
  if (!name) {
    throw new Error('Notification name required.');
  } else if (!user) {
    throw new Error('User required.');
  }

  const config = user.notifications.find((n) => {
    return n.name === name;
  });

  options = {
    ...rest,
    user,
    template: name,
  };

  if (config?.email) {
    await sendMail(options);
  }
  if (config?.sms) {
    await sendSms(options);
  }
  if (config?.push) {
    await sendPush(options);
  }
}

module.exports = {
  sendNotification,
};

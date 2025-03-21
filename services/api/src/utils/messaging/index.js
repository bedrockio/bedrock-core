const { sendSms } = require('./sms');
const { sendPush } = require('./push');
const { sendMail } = require('./mail');

async function sendMessage(options) {
  const { user, transport = getTransport(user) } = options;

  if (transport === 'email') {
    await sendMail(options);
  } else if (transport === 'sms') {
    await sendSms(options);
  } else if (transport === 'push') {
    await sendPush(options);
  } else {
    throw new Error('No transport found to send message.');
  }
}

function getTransport(user) {
  if (user.email) {
    return 'email';
  } else if (user.phone) {
    return 'sms';
  } else if (user.deviceToken) {
    return 'push';
  }
}

module.exports = {
  sendSms,
  sendMail,
  sendPush,
  sendMessage,
};

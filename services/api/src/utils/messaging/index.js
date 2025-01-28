const sms = require('./sms');
const mailer = require('./mailer');

async function sendMessage(options) {
  const { user, transport = getTransport(user) } = options;

  if (transport === 'email') {
    await mailer.sendMail(options);
  } else if (transport === 'sms') {
    await sms.sendMessage(options);
  } else {
    throw new Error('No transport found to send message.');
  }
}

function getTransport(user) {
  if (user.email) {
    return 'email';
  } else if (user.phone) {
    return 'sms';
  }
}

module.exports = {
  sms,
  mailer,
  sendMessage,
};

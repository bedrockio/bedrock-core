const sms = require('./sms');
const mailer = require('./mailer');

async function sendMessage(options) {
  const { user } = options;
  if (user.email) {
    await mailer.sendMail(options);
  } else if (user.phone) {
    await sms.sendMessage(options);
  }
}

module.exports = {
  sms,
  mailer,
  sendMessage,
};

const { sendSms } = require('./sms');
const { sendPush } = require('./push');
const { sendMail } = require('./mail');

async function sendMessage(options) {
  let { email, phone, user } = options;

  if (!email && !phone && !user) {
    throw new Error('sendMessage requires one of: "email", "phone", or "user".');
  }

  email ||= user?.email;
  phone ||= user?.phone;

  if (email) {
    await sendMail({
      ...options,
      email,
    });
  } else if (phone) {
    await sendSms({
      ...options,
      phone,
    });
  }
}

module.exports = {
  sendSms,
  sendMail,
  sendPush,
  sendMessage,
};

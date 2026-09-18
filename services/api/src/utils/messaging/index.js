import { sendSms } from './sms.js';
import { sendPush } from './push.js';
import { sendMail } from './mail.js';

async function sendMessage(options) {
  const { user, channel = getChannel(user) } = options;

  if (channel === 'email') {
    await sendMail(options);
  } else if (channel === 'sms') {
    await sendSms(options);
  } else if (channel === 'push') {
    await sendPush(options);
  } else {
    throw new Error('No channel found to send message.');
  }
}

function getChannel(user) {
  if (user.email) {
    return 'email';
  } else if (user.phone) {
    return 'sms';
  } else if (user.deviceToken) {
    return 'push';
  }
}

export { sendSms, sendMail, sendPush, sendMessage };

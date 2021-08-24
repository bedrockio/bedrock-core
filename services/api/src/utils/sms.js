const config = require('@bedrockio/config');
const { URLSearchParams } = require('url');
const fetch = require('node-fetch');

const TWILIO_AUTH_TOKEN = config.get('TWILIO_AUTH_TOKEN');
const TWILIO_ACCOUNT_SID = config.get('TWILIO_ACCOUNT_SID');
const TWILIO_MESSAGING_SERVICE_SID = config.get('TWILIO_MESSAGING_SERVICE_SID');

async function sendMessage(to, body, options = { validityPeriod: 10 }) {
  const params = new URLSearchParams();
  params.append('To', to);
  params.append('MessagingServiceSid', TWILIO_MESSAGING_SERVICE_SID);
  params.append('Body', body);
  if (options.validityPeriod) {
    params.append('ValidityPeriod', options.validityPeriod);
  }

  const Authorization = `Basic ${Buffer.from(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN).toString('base64')}`;

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      body: params,
      headers: {
        Authorization,
      },
    });

    const { message, status } = await response.json();

    if (message && status !== 200) {
      throw Error(message);
    }
  } catch (e) {
    throw Error(e.message);
  }
}

module.exports = {
  sendMessage,
};

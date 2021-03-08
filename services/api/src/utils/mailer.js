const postmark = require('postmark');
const config = require('@bedrockio/config');

const POSTMARK_FROM = config.get('POSTMARK_FROM');
const ENV_NAME = config.get('ENV_NAME');

function sendMail({ to, subject }, { html, text, options }) {
  if (!config.has('POSTMARK_APIKEY') || ENV_NAME === 'test') {
    if (ENV_NAME === 'test') {
      console.warn(`Sending email to ${to}`);
    } else {
      console.warn(`Sending email to ${to}`);
      console.warn(`Subject: ${subject}`);
      console.warn('Body:');
      console.warn(html);
      console.warn(options);
    }
    return Promise.resolve();
  } else {
    return new postmark.ServerClient(config.get('POSTMARK_APIKEY'))
      .sendEmail({
        From: POSTMARK_FROM,
        To: to,
        Subject: subject,
        TextBody: text,
        HtmlBody: html,
      })
      .catch((error) => {
        console.error(`Error happened while sending email to ${to} (${error.message})`);
        console.error(error);
      });
  }
}

module.exports = {
  sendMail,
};

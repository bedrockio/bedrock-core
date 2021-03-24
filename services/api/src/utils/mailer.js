const postmark = require('postmark');
const config = require('@bedrockio/config');
const { logger } = require('./logging');

const POSTMARK_FROM = config.get('POSTMARK_FROM');
const ENV_NAME = config.get('ENV_NAME');

function sendMail({ to, subject }, { html, text, options }) {
  if (!config.has('POSTMARK_APIKEY') || ENV_NAME === 'test') {
    if (ENV_NAME === 'test') {
      logger.warn(`Sending email to ${to}`);
    } else {
      logger.warn(`Sending email to ${to}`);
      logger.warn(`Subject: ${subject}`);
      logger.warn('Body:');
      logger.warn(html);
      logger.warn(options);
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
        logger.error(`Error happened while sending email to ${to} (${error.message})`);
        logger.error(error);
      });
  }
}

module.exports = {
  sendMail,
};

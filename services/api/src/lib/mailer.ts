import postmark from 'postmark';
import * as config from '@bedrockio/config';

const POSTMARK_FROM = config.get('POSTMARK_FROM');
const env = process.env.NODE_ENV;

const sendMail = ({ to, subject }, { html, text, options }) => {
  if (!config.has('POSTMARK_APIKEY') || env === 'test') {
    if (env === 'test') {
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
};

export { sendMail };

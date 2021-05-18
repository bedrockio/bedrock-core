const postmark = require('postmark');

const marked = require('marked');
const Mustache = require('mustache');
const fs = require('fs').promises;
const path = require('path');

const config = require('@bedrockio/config');
const { logger } = require('@bedrockio/instrumentation');

const POSTMARK_FROM = config.get('POSTMARK_FROM');
const ENV_NAME = config.get('ENV_NAME');

marked.use({
  walkTokens: (token) => {
    if (token.type === 'paragraph') {
      const tokens = token.tokens || [];
      if (tokens.length === 1 && tokens[0].type === 'strong') {
        const strong = tokens[0];
        const strongTokens = strong.tokens || [];
        if (strongTokens.length === 1 && strongTokens[0].type === 'link') {
          const link = strongTokens[0];
          link.title = '$button$';
        }
      }
    }
  },

  renderer: {
    link(href, title, text) {
      if (title === '$button$') {
        return `<a class="button" href="${href}">${text}</a>`;
      }
      return false;
    },
  },
});

const defaultOptions = {
  appName: config.get('APP_NAME'),
  appUrl: config.get('APP_URL'),
  appSupportEmail: config.get('APP_SUPPORT_EMAIL'),
  appCompanyAddress: config.get('APP_COMPANY_ADDRESS'),
};

const templatesDist = path.join(__dirname, '../../emails');
const templates = {};

async function fetchTemplate(file) {
  if (templates[file]) return templates[file];
  let content;
  try {
    content = (await fs.readFile(path.join(templatesDist, file))).toString();
  } catch (err) {
    logger.error(err);
    throw Error(`Cant load template ${file}.`);
  }

  templates[file] = file.includes('.md') ? marked(content) : content;
  return templates[file];
}

async function sendTemplatedMail({ template, layout = 'layout.html', subject, to, ...args }) {
  const [layoutStr, templateStr] = await Promise.all([fetchTemplate(layout), fetchTemplate(template)]);

  const options = {
    ...args,
    ...defaultOptions,
  };

  const content = Mustache.render(templateStr, options);

  const html = Mustache.render(layoutStr, {
    content,
    ...defaultOptions,
  });

  await sendMail({
    to,
    subject: Mustache.render(subject, options),
    html,
    options,
  });
}

function sendMail({ to, subject, html, text, options }) {
  if (!config.has('POSTMARK_APIKEY') || ENV_NAME === 'test') {
    if (ENV_NAME === 'test') {
      logger.debug(`Sending email to ${to}`);
    } else {
      logger.debug(`Sending email to ${to}`);
      logger.debug(`Subject: ${subject}`);
      logger.debug('Body:');
      logger.debug(html);
      logger.debug(options);
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
  sendTemplatedMail,
};

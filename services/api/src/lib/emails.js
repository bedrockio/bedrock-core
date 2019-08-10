const fs = require('fs');
const path = require('path');
const { sendMail } = require('./mailer');
const config = require('@kaareal/config');
const { template: templateFn } = require('./utils');
const { promisify } = require('util');
const templatesDist = path.join(__dirname, '../../templates/dist/emails');

const templates = {};

const defaultOptions = {
  appName: config.get('APP_NAME'),
  appUrl: config.get('APP_URL'),
  appSupportEmail: config.get('APP_SUPPORT_EMAIL'),
  appCompanyAddress: config.get('APP_COMPANY_ADDRESS')
};

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const defaultLanguage = 'en';

let isReady = false;
async function initialize() {
  if (isReady) return;
  const files = await readdir(templatesDist);
  await Promise.all(
    files.map((file) => {
      return readFile(path.join(templatesDist, file)).then((str) => {
        templates[file.replace(/.html$/, '')] = str.toString();
      });
    })
  );
  isReady = true;
}

function template(languageCode, templateName, map) {
  let templateStr = templates[`${templateName}.${languageCode}`];
  if (!templateStr) {
    templateStr = templates[`${templateName}.${defaultLanguage}`];
    if (templateStr) {
      console.warn(`Cant find template by ${languageCode} ${templateName}. Using ${defaultLanguage} template instead.`);
    } else {
      throw new Error(
        `Cant find template by ${languageCode} ${templateName}. Available templates: ${Object.keys(templates).join(
          ', '
        )}`
      );
    }
  }
  return templateFn(templateStr, map);
}

exports.sendWelcome = async (languageCode, { to, name }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    name
  };

  return sendMail(
    {
      to,
      subject: `Welcome to ${defaultOptions.appName}`
    },
    {
      html: template(languageCode, 'welcome', options),
      options
    }
  );
};

exports.sendResetPasswordUnknown = async (languageCode, { to }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    email: to
  };

  return sendMail(
    {
      to,
      subject: `Password Reset Request`
    },
    {
      html: template(languageCode, 'reset-password-unknown', options),
      options
    }
  );
};

exports.sendResetPassword = async (languageCode, { to, token }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    email: to,
    token
  };

  return sendMail(
    {
      to,
      subject: `Password Reset Request`
    },
    {
      html: template(languageCode, 'reset-password', options),
      options
    }
  );
};

exports.sendInvite = async (languageCode, { to, token, sender }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    senderName: sender.name,
    senderEmail: sender.email,
    token
  };
  return sendMail(
    {
      to,
      subject: `${sender.name} has invited you to join ${defaultOptions.appName}`
    },
    {
      html: template(languageCode, 'invite', options),
      options
    }
  );
};

exports.sendInviteKnown = async (languageCode, { to, token, sender }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    senderName: sender.name,
    senderEmail: sender.email,
    token
  };

  return sendMail(
    {
      to,
      subject: `${sender.name} has invited you to join ${defaultOptions.appName}`
    },
    {
      html: template(languageCode, 'invite-known', options),
      options
    }
  );
};

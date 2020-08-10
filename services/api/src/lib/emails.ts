const fs = require('fs');
const path = require('path');
const { sendMail } = require('./mailer');
const config = require('@bedrockio/config');
const { template: templateFn } = require('./utils/template');
const { promisify } = require('util');

const templatesDist = path.join(__dirname, '../../emails/dist');
const templates = {};

const defaultOptions = {
  appName: config.get('APP_NAME'),
  appUrl: config.get('APP_URL'),
  appSupportEmail: config.get('APP_SUPPORT_EMAIL'),
  appCompanyAddress: config.get('APP_COMPANY_ADDRESS'),
};

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

let isReady = false;
async function initialize() {
  if (isReady) return;
  const files = await readdir(templatesDist);
  await Promise.all(
    files.map((file) => {
      return readFile(path.join(templatesDist, file)).then((str) => {
        templates[file] = str.toString();
      });
    })
  );
  isReady = true;
}

function template(templateName, map) {
  const templateStr = templates[templateName];
  if (!templateStr)
    throw Error(`Cant find template by ${templateName}. Available templates: ${Object.keys(templates).join(', ')}`);
  return templateFn(templateStr, map);
}

exports.sendWelcome = async ({ to, name }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    name,
  };

  return sendMail(
    {
      to,
      subject: `Welcome to ${defaultOptions.appName}`,
    },
    {
      html: template('welcome.html', options),
      text: template('welcome.text', options),
      options,
    }
  );
};

exports.sendResetPasswordUnknown = async ({ to }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    email: to,
  };

  return sendMail(
    {
      to,
      subject: `Password Reset Request`,
    },
    {
      html: template('reset-password-unknown.html', options),
      text: template('reset-password-unknown.text', options),
      options,
    }
  );
};

exports.sendResetPassword = async ({ to, token }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    email: to,
    token,
  };

  return sendMail(
    {
      to,
      subject: `Password Reset Request`,
    },
    {
      html: template('reset-password.html', options),
      text: template('reset-password.text', options),
      options,
    }
  );
};

exports.sendInvite = async ({ to, token, sender }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    senderName: sender.name,
    senderEmail: sender.email,
    token,
  };
  return sendMail(
    {
      to,
      subject: `${sender.name} has invited you to join ${defaultOptions.appName}`,
    },
    {
      html: template('invite.html', options),
      text: template('invite.text', options),
      options,
    }
  );
};

exports.sendInviteKnown = async ({ to, token, sender }) => {
  await initialize();
  const options = {
    ...defaultOptions,
    senderName: sender.name,
    senderEmail: sender.email,
    token,
  };

  return sendMail(
    {
      to,
      subject: `${sender.name} has invited you to join ${defaultOptions.appName}`,
    },
    {
      html: template('invite-known.html', options),
      text: template('invite-known.text', options),
      options,
    }
  );
};

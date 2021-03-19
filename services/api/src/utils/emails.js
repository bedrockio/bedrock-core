const fs = require('fs');
const path = require('path');
const { sendMail } = require('./mailer');
const config = require('@bedrockio/config');
const marked = require('marked');
const Mustache = require('mustache');

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

const { promisify } = require('util');

const templatesDist = path.join(__dirname, '../../emails');
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
        if (file.includes('.md')) {
          templates[file] = marked(str.toString());
        } else {
          templates[file] = str.toString();
        }
      });
    })
  );
  isReady = true;
}

function template({ template, layout = 'layout.html', fields = {} }) {
  const layoutStr = templates[layout];
  const templateStr = templates[template];
  if (!layoutStr) {
    throw Error(`Cant find template by ${layout}. Available templates: ${Object.keys(templates).join(', ')}`);
  }
  if (!templateStr) {
    throw Error(`Cant find template by ${template}. Available templates: ${Object.keys(templates).join(', ')}`);
  }

  const templateRendered = Mustache.render(templateStr, fields);

  return Mustache.render(layoutStr, {
    content: templateRendered,
    defaultOptions,
  });
}

async function sendWelcome({ to, name }) {
  await initialize();
  const fields = {
    ...defaultOptions,
    name,
  };

  return sendMail(
    {
      to,
      subject: `Welcome to ${defaultOptions.appName}`,
    },
    {
      html: template({ template: 'welcome.md', fields }),
    }
  );
}

async function sendResetPassword({ to, token }) {
  await initialize();
  const fields = {
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
      html: template({ template: 'reset-password.md', fields }),
    }
  );
}

async function sendInvite({ to, token, sender }) {
  await initialize();
  const fields = {
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
      html: template({ template: 'invite.md', fields }),
    }
  );
}

module.exports = {
  sendWelcome,
  sendResetPassword,
  sendInvite,
};

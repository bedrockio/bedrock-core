const path = require('path');
const config = require('@bedrockio/config');
const { TemplateRenderer } = require('@bedrockio/templates');
const { getImageUrl, getImageDimensions } = require('./images');
const { Template } = require('../models');

const APP_URL = config.get('APP_URL');

const renderer = new TemplateRenderer({
  baseUrl: APP_URL,
  helpers: getHelpers(),
  params: {
    // TODO: change to getPublic
    ...config.getAll(),
  },
});

async function renderTemplate(options) {
  const { dir, ...rest } = resolveOptions(options);
  const template = await resolveTemplateArg(options);

  return renderer.run({
    dir,
    template,
    params: {
      ...rest,
      currentYear: new Date().getFullYear(),
      ...options.params,
    },
  });
}

function resolveOptions(options) {
  const { channel } = options;

  let dir;

  if (channel) {
    dir = path.resolve(__dirname, '../templates', channel);
  }

  return {
    dir,
    ...options,
  };
}

async function resolveTemplateArg(options) {
  const { body, template } = options;

  if (typeof template === 'string' && path.extname(template) !== '') {
    // Return template filename if an extension if found.
    return template;
  } else if (template) {
    const templateBody = await resolveTemplateBody(options);

    // If the template arg is a name then find the template
    // and return the body for the channel. Fall back to the
    // template name to find it as a file.
    return templateBody || template;
  } else {
    return body;
  }
}

async function resolveTemplate(options) {
  const { template: input } = options;

  if (input instanceof Template) {
    return input;
  } else if (typeof input === 'string') {
    return await Template.findOne({
      name: input,
    });
  }
}

async function resolveTemplateBody(options) {
  const template = await resolveTemplate(options);

  if (!template) {
    return;
  }

  const { channel } = options;

  if (!channel) {
    throw new Error('Channel required.');
  }

  const body = template[channel];

  if (!body) {
    throw new Error(`Template body not found for ${template.id}:${channel}`);
  }

  return body;
}

// Helpers

function getHelpers() {
  return {
    // Returns an image URL.
    imageUrl(image) {
      const upload = resolveUpload(image);
      return getImageUrl(upload);
    },

    // Returns a full HTML img tag.
    image(image, params) {
      if (!image) {
        return '';
      }

      const upload = resolveUpload(image);
      let { alt, ...transformParams } = params;

      alt ||= upload.filename;

      const url = getImageUrl(upload, transformParams);
      const dimensions = getImageDimensions(transformParams);

      const attr = {
        src: url,
        alt,
        ...dimensions,
      };

      return ['img', attr];
    },
  };
}

function resolveUpload(arg) {
  if (Array.isArray(arg)) {
    return arg[0];
  }
  return arg;
}

module.exports = {
  renderTemplate,
  resolveTemplate,
};

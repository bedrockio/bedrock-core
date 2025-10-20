const path = require('path');
const config = require('@bedrockio/config');
const { TemplateRenderer } = require('@bedrockio/templates');
const { getImageUrl, getImageDimensions } = require('./images');
const { Template } = require('../models');

const APP_URL = config.get('APP_URL');

const renderer = new TemplateRenderer({
  baseUrl: APP_URL,
  helpers: getDefaultHelpers(),
  params: {
    // TODO: change to getPublic
    ...config.getAll(),
  },
});

async function renderTemplate(options) {
  const { dir, ...rest } = resolveOptions(options);
  const template = await resolveTemplate(options);

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

// Note this function is intentionally NOT memoized
// as new templates may be created and must be found.
async function resolveTemplate(options) {
  let { body, template, channel } = options;

  template ||= body;
  template ||= '';

  if (isTemplateName(template) && channel) {
    const doc = await Template.findOne({
      name: template,
    });

    template = doc?.[channel] || template;
  }

  return template;
}

// Best guess if this is template name or not.
function isTemplateName(template) {
  if (template && path.extname(template)) {
    return true;
  }
  return !template.includes('\n');
}

// Helpers

function getDefaultHelpers() {
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
};

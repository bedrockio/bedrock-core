const config = require('@bedrockio/config');
const { pick } = require('lodash');

const API_URL = config.get('API_URL');
const ENV_NAME = config.get('ENV_NAME');
const TRANSFORM_IMAGES = config.get('CLOUDFLARE_TRANSFORM_IMAGES');

const PARAMS = {
  banner: {
    width: 800,
  },
  avatar: {
    height: 150,
  },
};

function getImagePath(arg) {
  if (!arg) {
    return null;
  }
  const id = String(arg._id || arg);
  return `/1/uploads/${id}/raw`;
}

function getImageUrl(arg, options) {
  if (canTransformImage(options)) {
    return getTransformedImage(arg, options);
  } else {
    return new URL(getImagePath(arg), API_URL).toString();
  }
}

function canTransformImage(options = {}) {
  return TRANSFORM_IMAGES && ENV_NAME !== 'development' && !options.raw;
}

// Requires Image Transformations API to be enabled for domain here:
// https://dash.cloudflare.com/<ACCOUNT>/images/delivery-zones
function getTransformedImage(arg, options) {
  const path = getImagePath(arg);

  if (!path) {
    return;
  }

  const params = resolveParams(options);
  const p = Object.entries(params)
    .map((e) => e.join('='))
    .join(',');

  return new URL(`/cdn-cgi/image/${p}${path}`, API_URL).toString();
}

function getImageDimensions(options) {
  const dimensions = pick(resolveParams(options), 'width', 'height');
  return Object.keys(dimensions).length === 0 ? null : dimensions;
}

function resolveParams(options = {}) {
  let { type, ...params } = options;

  return {
    ...PARAMS[type],
    ...params,
  };
}

module.exports = {
  getImageUrl,
  getImageDimensions,
};

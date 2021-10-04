const path = require('path');
const fetch = require('node-fetch');
const config = require('@bedrockio/config');
const { APP_URL, VIMEO_ACCESS_TOKEN, UPLOADS_GCS_BUCKET } = config.getAll();

const BASE_URL = 'https://api.vimeo.com';

async function createVimeoUpload(video) {
  const ext = path.extname(video.upload.filename);
  const url = `${BASE_URL}/me/videos`;
  const storageUrl = `https://storage.googleapis.com/${UPLOADS_GCS_BUCKET}/${video.upload.hash}${ext}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: video.name,
      upload: {
        approach: 'pull',
        link: storageUrl,
      },
      privacy: {
        view: 'nobody',
        embed: 'whitelist',
      },
      embed: {
        playbar: true,
      },
    }),
  });
  const data = await res.json();
  video.vimeoUri = data.uri;
  await Promise.all([createVideoThumbnail(video), addPrivateDomain(video)]);
  await video.save();
}

async function createVideoThumbnail(video) {
  const url = `${BASE_URL}${video.vimeoUri}/pictures`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      active: true,
      time: 2,
    }),
  });
  const data = await res.json();
  video.vimeoThumbnail = data.base_link;
}

async function getVimeoStatus(video) {
  const url = `${BASE_URL}${video.vimeoUri}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
      'Content-Type': 'application/json',
    },
  });
  return {
    ...(await res.json()),
    domains: await getPrivateDomains(video),
  };
}

async function getPrivateDomains(video) {
  const url = `${BASE_URL}${video.vimeoUri}/privacy/domains`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  return data.data;
}

const DOMAIN_REG = /https?:\/\/(.+?)(:\d{4})?$/;

async function addPrivateDomain(video) {
  const domain = APP_URL.replace(DOMAIN_REG, '$1');
  const url = `${BASE_URL}${video.vimeoUri}/privacy/domains/${domain}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${VIMEO_ACCESS_TOKEN}`,
      Accept: 'application/vnd.vimeo.*+json;version=3.4',
      'Content-Type': 'application/json',
    },
  });
  if (res.status >= 400) {
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error);
    }
  }
}

module.exports = {
  getVimeoStatus,
  createVimeoUpload,
};

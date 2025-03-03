const path = require('path');
const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');
const admin = require('firebase-admin');

const ENV_NAME = config.get('ENV_NAME');
const FIREBASE_DEV_TOKEN = config.get('FIREBASE_DEV_TOKEN');

const client = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const { interpolate, loadTemplate } = require('./utils');
const TEMPLATE_DIR = path.join(__dirname, '../../templates/push');

async function sendPush(options) {
  const { user, ...params } = options;
  let { deviceToken } = user;

  const { body: templateBody, meta } = await loadTemplate(TEMPLATE_DIR, options);

  const body = interpolate(templateBody, params);
  const title = interpolate(meta.title || '{{subject}}', params);

  if (ENV_NAME === 'development') {
    if (!FIREBASE_DEV_TOKEN) {
      throw new Error('No Firebase development token exists.');
    }
    // To test locally download the service account key and set
    // GOOGLE_APPLICATION_CREDENTIALS to its path. Then set the
    // FIREBASE_DEV_TOKEN to a registered device token id.
    deviceToken = FIREBASE_DEV_TOKEN;
  }

  if (!deviceToken) {
    throw new Error(`No device token for ${user.id}.`);
  }

  try {
    // Note that a message may specify a title, a body, or both.
    // If no body is specified it will not be displayed.
    // If no title is specified the title will be your app name.
    await client.messaging().send({
      notification: {
        title,
        body,
      },
      token: deviceToken,
    });
  } catch (error) {
    const { code } = error;
    logger.error(`Firebase error: ${code}`);
    throw error;
  }
}

module.exports = {
  sendPush,
};

const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');
const admin = require('firebase-admin');
const { getInterpolator } = require('./utils');

const ENV_NAME = config.get('ENV_NAME');
const FIREBASE_DEV_TOKEN = config.get('FIREBASE_DEV_TOKEN');

const client = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const interpolate = getInterpolator('push');

async function sendPush(options) {
  let { token, ...params } = options;

  token ||= params.user?.deviceToken;

  const { body, title, image } = await interpolate(options);

  if (ENV_NAME === 'development') {
    // To test locally download the service account key and set
    // GOOGLE_APPLICATION_CREDENTIALS to its path. Then set the
    // FIREBASE_DEV_TOKEN to a registered device token id.
    if (FIREBASE_DEV_TOKEN) {
      token = FIREBASE_DEV_TOKEN;
    } else {
      const to = params.user?.name || token;
      logger.info(`
---------- Push Sent -------------
To: ${to || ''}
Title: ${title || ''}
Image: ${image || ''}

${body}
--------------------------
      `);
      return;
    }
  }

  if (!token) {
    throw new Error(`No device token passed.`);
  }

  try {
    // Note that a message may specify a title, a body, or both.
    // If no body is specified it will not be displayed.
    // If no title is specified the title will be your app name.
    await client.messaging().send({
      notification: {
        title,
        body,
        ...(image && {
          imageUrl: image,
        }),
      },
      token: token,
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

const config = require('@bedrockio/config');
const logger = require('@bedrockio/logger');
const admin = require('firebase-admin');
const { renderTemplate } = require('../templates');

const ENV_NAME = config.get('ENV_NAME');
const FIREBASE_DEV_TOKEN = config.get('FIREBASE_DEV_TOKEN');

const client = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

async function sendPush(options) {
  let { title, image, data } = options;

  let tokens = resolveTokens(options);

  const { body, meta } = await renderTemplate({
    channel: 'push',
    ...options,
  });

  title ||= meta.title;
  image ||= meta.image;

  if (ENV_NAME === 'development') {
    // To test locally download the service account key and set
    // GOOGLE_APPLICATION_CREDENTIALS to its path. Then set the
    // FIREBASE_DEV_TOKEN to a registered device token id.
    if (FIREBASE_DEV_TOKEN) {
      tokens = [FIREBASE_DEV_TOKEN];
    } else {
      const to = options.user?.name || tokens[0];
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

  if (!tokens.length) {
    throw new Error(`No device token passed.`);
  }

  try {
    // Note that a message may specify a title, a body, or both.
    // If no body is specified it will not be displayed.
    // If no title is specified the title will be your app name.
    const { responses } = await client.messaging().sendEachForMulticast({
      notification: {
        title,
        body,
        ...(image && {
          imageUrl: image,
        }),
      },
      data,
      tokens,
    });

    for (let response of responses) {
      if (!response.success) {
        logger.error(response.error.message);
      }
    }
  } catch (error) {
    const { code } = error;
    logger.error(`Firebase error: ${code}`);
    throw error;
  }
}

function resolveTokens(options) {
  const { user, token, tokens } = options;
  if (tokens) {
    return tokens;
  } else if (token) {
    return [token];
  } else if (user) {
    return [user.deviceToken];
  }
}

module.exports = {
  sendPush,
};

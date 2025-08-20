const { Application } = require('../../models');
const { customAlphabet } = require('nanoid');

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 16);

function applicationMiddleware({ ignorePaths = [] }) {
  return async (ctx, next) => {
    const path = ctx.url;

    const isPathIgnored = ignorePaths.find((ignorePath) => {
      if (ignorePath instanceof RegExp) {
        return ignorePath.test(path);
      }
      return ignorePath === path;
    });

    if (isPathIgnored) {
      return next();
    }

    const apiKey = ctx.get('api-key');

    if (!apiKey) {
      return next();
    }

    const application = await Application.findOneAndUpdate(
      { apiKey },
      {
        $inc: { requestCount: 1 },
      },
    );

    if (!application) {
      return ctx.throw(400, `The "ApiKey" did not match any known applications`);
    }

    const requestId = `${application.apiKey}-${nanoid()}`;
    ctx.set('Request-Id', requestId);

    await next();

    // This could be done as upsert
    await Application.updateOne(
      {
        _id: application.id,
      },
      {
        $set: {
          lastUsedAt: new Date(),
        },
      },
      {
        upsert: true,
      },
    );
  };
}

module.exports = {
  applicationMiddleware,
};

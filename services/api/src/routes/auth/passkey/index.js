const Router = require('@koa/router');
const yd = require('@bedrockio/yada');

const { validateBody } = require('../../../utils/middleware/validate');
const { authenticate } = require('../../../utils/middleware/authenticate');

const { login, register, signupValidation } = require('../../../utils/auth');
const { User } = require('../../../models');

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  removePasskey,
} = require('./utils');

const router = new Router();

router
  .post(
    '/login-generate',
    validateBody({
      email: yd.string().email().required(),
    }),
    async (ctx) => {
      const { email } = ctx.request.body;
      const user = await User.findOne({ email });

      if (!user) {
        ctx.throw(404, 'No user exists for that email.');
      }

      try {
        const options = await generateAuthenticationOptions(user);
        await user.save();

        ctx.body = {
          data: options,
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    }
  )
  .post(
    '/login-verify',
    validateBody({
      email: yd.string().email().required(),
      response: yd.object().required(),
    }),
    async (ctx) => {
      const { email, response } = ctx.request.body;
      const user = await User.findOne({ email });

      if (!user) {
        ctx.throw(400, 'No user exists for that email.');
      }

      try {
        await verifyAuthenticationResponse(user, response);

        ctx.body = {
          data: {
            token: await login(user, ctx),
          },
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    }
  )
  .post('/register-generate', validateBody(signupValidation), async (ctx) => {
    const { body } = ctx.request;
    const { email } = body;

    // Note: Register here technically refers to registering an authenticator.
    // For now we are effectively only allowing a single authenticator per
    // user although this is stored in an array to allow this as an option
    // in the future.
    if (await User.exists({ email })) {
      ctx.throw(400, 'A user with that email already exists');
    }

    try {
      const user = new User(ctx.request.body);
      const options = await generateRegistrationOptions(user);
      await user.save();
      ctx.body = {
        data: options,
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  })
  .post(
    '/register-verify',
    validateBody({
      email: yd.string().email().required(),
      response: yd.object().required(),
    }),
    async (ctx) => {
      const { email, response } = ctx.request.body;

      const user = await User.findOne({ email });

      if (!user) {
        ctx.throw(400, 'No user exists for that email.');
      }

      try {
        await verifyRegistrationResponse(user, response);
        const token = await register(user, ctx);

        ctx.body = {
          data: {
            token,
          },
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    }
  )
  .use(authenticate())
  .post('/enable-generate', async (ctx) => {
    const { authUser } = ctx.state;

    let options;
    try {
      options = await generateRegistrationOptions(authUser);
    } catch (error) {
      ctx.throw(400, error);
    }

    await authUser.save();

    ctx.body = {
      data: options,
    };
  })
  .post(
    '/enable-verify',
    validateBody({
      response: yd.object().required(),
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      const { response } = ctx.request.body;

      try {
        await verifyRegistrationResponse(authUser, response);
        await authUser.save();

        ctx.body = {
          data: authUser,
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    }
  )
  .post('/disable', async (ctx) => {
    const { authUser } = ctx.state;
    removePasskey(authUser);
    await authUser.save();

    ctx.body = {
      data: authUser,
    };
  });

module.exports = router;

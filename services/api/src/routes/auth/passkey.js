const Router = require('@koa/router');
const yd = require('@bedrockio/yada');

const { validateBody } = require('../../utils/middleware/validate');
const { authenticate } = require('../../utils/middleware/authenticate');

const { login } = require('../../utils/auth');

const {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  authenticatePasskeyResponse,
  registerNewPasskey,
  removePasskey,
} = require('../../utils/auth/passkey');

const router = new Router();

router
  .post('/generate-login', async (ctx) => {
    try {
      ctx.body = {
        data: await generateAuthenticationOptions(),
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  })
  .post(
    '/verify-login',
    validateBody({
      token: yd.string().required(),
      response: yd.object().required(),
    }),
    async (ctx) => {
      const { token, response } = ctx.request.body;

      try {
        const user = await authenticatePasskeyResponse({
          token,
          response,
        });

        ctx.body = {
          data: {
            token: await login(ctx, user),
          },
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    }
  )
  .use(authenticate())
  .post('/generate-new', async (ctx) => {
    const { authUser } = ctx.state;

    try {
      const options = await generateRegistrationOptions(authUser);
      await authUser.save();
      ctx.body = {
        data: options,
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  })
  .post(
    '/verify-new',
    validateBody({
      token: yd.string().required(),
      response: yd.object().required(),
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      const { token, response } = ctx.request.body;

      try {
        await registerNewPasskey(authUser, {
          ctx,
          token,
          response,
        });

        ctx.body = {
          data: authUser,
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    }
  )
  .delete('/:id', async (ctx) => {
    const { id } = ctx.params;

    if (!id) {
      ctx.throw(400, 'No id passed.');
    }
    const { authUser } = ctx.state;
    removePasskey(authUser, id);
    await authUser.save();

    ctx.body = {
      data: authUser,
    };
  });

module.exports = router;

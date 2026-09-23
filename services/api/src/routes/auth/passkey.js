import Router from '@koa/router';
import yd from '@bedrockio/yada';
import config from '@bedrockio/config';

import { validateBody } from '../../utils/middleware/validate.js';
import { authenticate } from '../../utils/middleware/authenticate.js';
import { expandRoles } from '../../utils/permissions.js';

import { login } from '../../utils/auth/index.js';

import {
  generateRegistrationOptions,
  generateAuthenticationOptions,
  authenticatePasskeyResponse,
  registerNewPasskey,
  removePasskey,
} from '../../utils/auth/passkey.js';

const router = new Router();

router
  .use(async (ctx, next) => {
    if (!config.get('AUTH_PASSKEY', 'boolean')) {
      ctx.throw(403, 'Passkey authentication is disabled.');
    }
    await next();
  })
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
    },
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
          data: expandRoles(authUser, ctx),
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
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
      data: expandRoles(authUser, ctx),
    };
  });

export default router;

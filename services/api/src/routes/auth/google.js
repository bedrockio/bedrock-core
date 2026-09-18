import Router from '@koa/router';
import yd from '@bedrockio/yada';
import { validateBody } from '../../utils/middleware/validate.js';
import { authenticate } from '../../utils/middleware/authenticate.js';

import { login } from '../../utils/auth/index.js';
import { createAuthToken } from '../../utils/tokens.js';
import { verifyToken, upsertGoogleAuthenticator, removeGoogleAuthenticator } from '../../utils/auth/google.js';

import { User, AuditEntry } from '../../models/index.js';

const router = new Router();

router
  .post(
    '/',
    validateBody({
      code: yd.string().required(),
    }),
    async (ctx) => {
      const { code } = ctx.request.body;

      let payload;
      try {
        payload = await verifyToken(code);
      } catch (error) {
        ctx.throw(400, error);
      }

      let user = await User.findOne({
        email: payload.email,
      });

      let token;
      let result;

      if (user) {
        token = await login(ctx, user, {
          message: 'Logged in with Google',
        });

        result = 'login';
      } else {
        user = await User.create({
          ...payload,
        });

        token = createAuthToken(ctx, user);

        await AuditEntry.append('Signed Up with Google', {
          ctx,
          actor: user,
        });

        result = 'signup';
      }

      upsertGoogleAuthenticator(user);
      await user.save();

      ctx.body = {
        data: {
          token,
          result,
        },
      };
    },
  )
  .use(authenticate())
  .post('/disable', async (ctx) => {
    const { authUser } = ctx.state;
    removeGoogleAuthenticator(authUser);
    await authUser.save();

    ctx.body = {
      data: authUser,
    };
  });

export default router;

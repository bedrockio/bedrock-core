import Router from '@koa/router';
import yd from '@bedrockio/yada';
import { validateBody } from '../../utils/middleware/validate.js';
import { authenticate } from '../../utils/middleware/authenticate.js';
import documentation from '../../utils/documentation.js';

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
    documentation.include(
      documentation.description(
        'Google Login',
        'Logs in with a Google credential, creating a new user when no account matches its email.',
      ),
      documentation.success(200, {
        description: '`result` is `login` for an existing user or `signup` for a newly created one.',
        schema: { data: { token: yd.string(), result: yd.string().allow('login', 'signup') } },
        example: { data: { token: 'eyJhbGciOi...', result: 'signup' } },
      }),
    ),
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
  .post(
    '/disable',
    documentation.include(
      documentation.description('Disable Google Login', 'Unlinks Google sign-in from the authenticated user.'),
      documentation.success(200, {
        description: 'Google unlinked; returns the updated user.',
        schema: { data: User },
      }),
    ),
    async (ctx) => {
      const { authUser } = ctx.state;
      removeGoogleAuthenticator(authUser);
      await authUser.save();

      ctx.body = {
        data: authUser,
      };
    },
  );

export default router;

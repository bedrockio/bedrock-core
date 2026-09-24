import Router from '@koa/router';
import yd from '@bedrockio/yada';
import { validateBody } from '../../utils/middleware/validate.js';
import { authenticate } from '../../utils/middleware/authenticate.js';
import documentation from '../../utils/documentation.js';

import { login } from '../../utils/auth/index.js';
import { createAuthToken } from '../../utils/tokens.js';
import { verifyToken, upsertAppleAuthenticator, removeAppleAuthenticator } from '../../utils/auth/apple.js';
import { User, AuditEntry } from '../../models/index.js';

const router = new Router();

router
  .post(
    '/',
    validateBody({
      token: yd.string().required(),
      firstName: yd.string(),
      lastName: yd.string(),
    }),
    documentation.include(
      documentation.description(
        'Apple Login',
        'Logs in with an Apple identity token, creating a new user when no account matches its email.',
      ),
      documentation.success(200, {
        description: '`result` is `login` for an existing user or `signup` for a newly created one.',
        schema: { data: { token: yd.string(), result: yd.string().allow('login', 'signup') } },
        example: { data: { token: 'eyJhbGciOi...', result: 'login' } },
      }),
    ),
    async (ctx) => {
      const { token: appleToken, firstName, lastName } = ctx.request.body;

      let payload;
      try {
        payload = await verifyToken(appleToken);
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
          message: 'Logged in with Apple',
        });

        result = 'login';
      } else {
        try {
          user = await User.create({
            ...payload,
            firstName,
            lastName,
          });
        } catch {
          ctx.throw('Signup failed. Remove your Apple registration.');
        }

        token = createAuthToken(ctx, user);

        await AuditEntry.append('Signed Up with Apple', {
          ctx,
          actor: user,
        });

        result = 'signup';
      }

      upsertAppleAuthenticator(user);
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
    '/enable',
    validateBody({
      token: yd.string().required(),
    }),
    documentation.include(
      documentation.description('Enable Apple Login', 'Links Sign in with Apple to the authenticated user.'),
      documentation.success(200, {
        description: 'Apple linked; returns the updated user.',
        schema: { data: User },
      }),
    ),
    async (ctx) => {
      const { token } = ctx.request.body;
      const { authUser } = ctx.state;

      try {
        await verifyToken(token);
        upsertAppleAuthenticator(authUser);
        await authUser.save();
      } catch (error) {
        ctx.throw(400, error);
      }

      ctx.body = {
        data: authUser,
      };
    },
  )
  .post(
    '/disable',
    documentation.include(
      documentation.description('Disable Apple Login', 'Unlinks Sign in with Apple from the authenticated user.'),
      documentation.success(200, {
        description: 'Apple unlinked; returns the updated user.',
        schema: { data: User },
      }),
    ),
    async (ctx) => {
      const { authUser } = ctx.state;
      // Note that AppleId allows for revoking tokens, however this does
      // not seem to remove it from the "Sign in with Apple" list or have
      // any effect on subsequent logins, so skipping this step and simply
      // remove the authenticator.
      removeAppleAuthenticator(authUser);
      await authUser.save();

      ctx.body = {
        data: authUser,
      };
    },
  );

export default router;

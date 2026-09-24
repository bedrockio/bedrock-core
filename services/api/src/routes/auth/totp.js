import Router from '@koa/router';
import yd from '@bedrockio/yada';
import { validateBody } from '../../utils/middleware/validate.js';
import { authenticate } from '../../utils/middleware/authenticate.js';

import { expandRoles } from '../../utils/permissions.js';
import { login, verifyLoginAttempts } from '../../utils/auth/index.js';
import { verifyCode, verifyTotp, generateTotp, enableTotp, revokeTotp } from '../../utils/auth/totp.js';

import documentation from '../../utils/documentation.js';
import { User, AuditEntry } from '../../models/index.js';
import { findUser } from './utils.js';

const router = new Router();

router
  .post(
    '/login',
    validateBody({
      phone: yd.string().phone(),
      email: yd.string().email(),
      code: yd.string().length(6).required(),
    }),
    documentation.include(
      documentation.description('TOTP Login', 'Exchanges a code from an authenticator app for an auth token.'),
      documentation.success(200, {
        description: 'Code accepted.',
        schema: { data: { token: yd.string() } },
        example: { data: { token: 'eyJhbGciOi...' } },
      }),
      documentation.error(
        401,
        'Wrong or expired code, or too many recent attempts. Each failure extends a timeout before the next attempt is accepted.',
      ),
    ),
    async (ctx) => {
      const { code } = ctx.request.body;

      const user = await findUser(ctx);

      if (!user) {
        ctx.throw(400, 'User not found.');
      }

      try {
        await verifyLoginAttempts(user, ctx);
      } catch (error) {
        await user.save();
        ctx.throw(401, error);
      }

      try {
        await verifyTotp(user, code);
      } catch (error) {
        await user.save();
        await AuditEntry.append('TOTP Verification Failure', {
          ctx,
          actor: user,
        });
        ctx.throw(401, error);
      }

      ctx.body = {
        data: {
          token: await login(ctx, user),
        },
      };
    },
  )
  .use(authenticate())
  .post(
    '/request',
    documentation.include(
      documentation.description(
        'Request TOTP Secret',
        'Generates a new authenticator secret and otpauth URL for the user to scan before enabling TOTP.',
      ),
      documentation.success(200, {
        description: 'Secret generated. It is not stored until TOTP is enabled.',
        schema: { data: { url: yd.string(), secret: yd.string() } },
        example: {
          data: { url: 'otpauth://totp/Bedrock?secret=JBSWY3DPEHPK3PXP', secret: 'JBSWY3DPEHPK3PXP' },
        },
      }),
    ),
    async (ctx) => {
      try {
        ctx.body = {
          data: generateTotp(),
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
  )
  .post(
    '/enable',
    validateBody({
      secret: yd.string().required(),
      code: yd.string().length(6).required(),
    }),
    documentation.include(
      documentation.description(
        'Enable TOTP',
        'Verifies a code against the requested secret and stores it as the TOTP authenticator of the authenticated user.',
      ),
      documentation.success(200, {
        description: 'TOTP enabled; returns the updated user.',
        schema: { data: User },
      }),
    ),
    async (ctx) => {
      const { secret, code } = ctx.request.body;
      const { authUser } = ctx.state;
      try {
        verifyCode(secret, code);
        enableTotp(authUser, secret);
        await authUser.save();
        ctx.body = {
          data: expandRoles(authUser, ctx),
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
  )
  .post(
    '/disable',
    documentation.include(
      documentation.description(
        'Disable TOTP',
        'Removes the TOTP authenticator of the authenticated user and resets TOTP multi-factor to none.',
      ),
      documentation.success(200, {
        description: 'TOTP disabled; returns the updated user.',
        schema: { data: User },
      }),
    ),
    async (ctx) => {
      const { authUser } = ctx.state;
      try {
        await revokeTotp(authUser);
        ctx.body = {
          data: expandRoles(authUser, ctx),
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
  );

export default router;

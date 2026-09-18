import Router from '@koa/router';
import yd from '@bedrockio/yada';
import { validateBody } from '../../utils/middleware/validate.js';

import { sendOtp } from '../../utils/auth/otp.js';
import { verifyOtp } from '../../utils/auth/otp.js';
import { login, verifyLoginAttempts } from '../../utils/auth/index.js';

import { AuditEntry } from '../../models/index.js';
import { findUser } from './utils.js';

const router = new Router();

router
  .post(
    '/send',
    validateBody({
      type: yd.string().allow('link', 'code').default('code'),
      channel: yd.string().allow('email', 'sms').default('email'),
      email: yd.string().email(),
      phone: yd.string().phone(),
    }),
    async (ctx) => {
      const { body } = ctx.request;
      const user = await findUser(ctx);

      const challenge = await sendOtp(user, {
        ...body,
        phase: 'login',
      });

      ctx.body = {
        data: {
          challenge,
        },
      };
    },
  )
  .post(
    '/login',
    validateBody({
      code: yd.string().length(6).required(),
      email: yd.string().email(),
      phone: yd.string().phone(),
    }),
    async (ctx) => {
      const { code, email, phone } = ctx.request.body;
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
        await verifyOtp(user, code);
      } catch (error) {
        await user.save();
        await AuditEntry.append('OTP Verification Failure', {
          ctx,
          actor: user,
        });
        ctx.throw(401, error);
      }

      if (email) {
        user.emailVerified = true;
      } else if (phone) {
        user.phoneVerified = true;
      }

      ctx.body = {
        data: {
          token: await login(ctx, user),
        },
      };
    },
  );

export default router;

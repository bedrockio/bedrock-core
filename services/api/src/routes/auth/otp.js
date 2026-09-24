import Router from '@koa/router';
import yd from '@bedrockio/yada';
import { validateBody } from '../../utils/middleware/validate.js';

import { sendOtp } from '../../utils/auth/otp.js';
import { verifyOtp } from '../../utils/auth/otp.js';
import { login, verifyLoginAttempts } from '../../utils/auth/index.js';

import { AuditEntry } from '../../models/index.js';
import { findUser, validateIdentity } from './utils.js';

const router = new Router();

router
  .post(
    '/send',
    validateBody(
      validateIdentity({
        type: yd.string().allow('link', 'code').default('code'),
        channel: yd.string().allow('email', 'sms'),
        email: yd.string().email(),
        phone: yd.string().phone(),
      }),
    ),
    async (ctx) => {
      const { body } = ctx.request;
      const user = await findUser(ctx);

      const challenge = await sendOtp(user, {
        ...body,
        // Send to whichever identifier named the account unless told otherwise.
        channel: body.channel || (body.phone ? 'sms' : 'email'),
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
    validateBody(
      validateIdentity({
        code: yd.string().length(6).required(),
        email: yd.string().email(),
        phone: yd.string().phone(),
      }),
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

      let authenticator;
      try {
        authenticator = await verifyOtp(user, code);
      } catch (error) {
        await user.save();
        await AuditEntry.append('OTP Verification Failure', {
          ctx,
          actor: user,
        });
        ctx.throw(401, error);
      }

      // Verify the channel the code was delivered to, not the one used to look up the user.
      if (authenticator.channel === 'email') {
        user.emailVerified = true;
      } else if (authenticator.channel === 'sms') {
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

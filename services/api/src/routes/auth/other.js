import Router from '@koa/router';
import yd from '@bedrockio/yada';
import { validateBody } from '../../utils/middleware/validate.js';
import { authenticate } from '../../utils/middleware/authenticate.js';
import { expandRoles } from '../../utils/permissions.js';
import { removeAuthToken } from '../../utils/tokens.js';
import { AuditEntry } from '../../models/index.js';

const router = new Router();

router
  .use(authenticate())
  .post(
    '/logout',
    validateBody({
      all: yd.boolean(),
      jti: yd.string(),
    }),
    authenticate(),
    async (ctx) => {
      const user = ctx.state.authUser;
      const { body } = ctx.request;
      const jti = body.jti || ctx.state.jwt.jti;
      if (body.all) {
        user.authTokens = [];
      } else if (jti) {
        removeAuthToken(user, jti);
      }
      await user.save();

      await AuditEntry.append('Logout', {
        ctx,
      });

      ctx.status = 204;
    },
  )
  .patch(
    '/mfa-method',
    validateBody({
      method: yd.string().allow(['none', 'sms', 'email', 'totp']),
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      const { method } = ctx.request.body;

      if (method === 'sms' && !authUser.phone) {
        ctx.throw(400, 'No phone number set.');
      } else if (method === 'email' && !authUser.email) {
        ctx.throw(400, 'No email address set.');
      }

      authUser.mfaMethod = method;
      await authUser.save();

      ctx.body = {
        data: expandRoles(authUser, ctx),
      };
    },
  );

export default router;

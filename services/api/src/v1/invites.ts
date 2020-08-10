import Router from '@koa/router';
import Joi from '@hapi/joi';
import { validate } from '../middlewares/validate';
import { authenticate, fetchUser, checkUserRole } from '../middlewares/authenticate';
import { NotFoundError, BadRequestError, GoneError } from '../lib/errors';
import Invite from '../models/invite';
import User from '../models/user';

import { sendInvite } from '../lib/emails';
import { createUserTemporaryToken } from '../lib/tokens';

const router = new Router();

function getToken(invite) {
  return createUserTemporaryToken({ inviteId: invite._id, email: invite.email }, 'invite');
}

router
  .param('inviteId', async (id, ctx, next) => {
    const invite = await Invite.findById(id);
    ctx.state.invite = invite;

    if (!invite) {
      throw new NotFoundError();
    } else if (invite.deletedAt) {
      throw new GoneError();
    }

    return next();
  })
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .use(checkUserRole({ role: 'admin' }))
  .post(
    '/search',
    validate({
      body: Joi.object({
        skip: Joi.number().default(0),
        sort: Joi.object({
          field: Joi.string().required(),
          order: Joi.string().required(),
        }).default({
          field: 'createdAt',
          order: 'asc',
        }),
        limit: Joi.number().positive().default(50),
      }),
    }),
    async (ctx) => {
      const { sort, skip, limit } = ctx.request.body;
      const query = { deletedAt: { $exists: false } };
      const invites = await Invite.find(query)
        .sort({ [sort.field]: sort.order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await await Invite.countDocuments(query);

      ctx.body = {
        data: invites,
        meta: {
          total,
          skip,
          limit,
        },
      };
    }
  )
  .post(
    '/',
    validate({
      body: Joi.object({
        emails: Joi.array().items(Joi.string().email()).required(),
      }),
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      const { emails } = ctx.request.body;

      for (let email of [...new Set(emails)]) {
        if ((await User.countDocuments({ email })) > 0) {
          throw new BadRequestError(`${email} is already a user.`);
        }
        const invite = await Invite.findOneAndUpdate(
          {
            email,
            status: 'invited',
          },
          { status: 'invited', email, $unset: { deletedAt: 1 } },
          {
            new: true,
            upsert: true,
          }
        );
        await sendInvite({ email, sender: authUser, token: getToken(invite) });
      }
      ctx.status = 204;
    }
  )
  .post('/:inviteId/resend', async (ctx) => {
    const { invite, authUser } = ctx.state;
    await sendInvite({ email: invite.email, sender: authUser, token: getToken(invite) });
    ctx.status = 204;
  })
  .delete('/:inviteId', async (ctx) => {
    const { invite } = ctx.state;
    await invite.delete();
    ctx.status = 204;
  });

export default router;

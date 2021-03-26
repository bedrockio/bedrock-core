const Router = require('@koa/router');
const Joi = require('joi');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');

const { NotFoundError, BadRequestError, GoneError } = require('../utils/errors');
const { Invite, User } = require('../models');

const { sendInvite } = require('../utils/emails');
const { createUserTemporaryToken } = require('../utils/tokens');

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
  .use(requirePermissions({ endpoint: 'users', permission: 'read', scope: 'global' }))
  .post(
    '/search',
    validateBody(
      Invite.getSearchValidation(),
    ),
    async (ctx) => {
      const { data, meta } = await Invite.search(ctx.request.body);
      ctx.body = {
        data,
        meta,
      };
    }
  )
  .use(requirePermissions({ endpoint: 'users', permission: 'write', scope: 'global' }))
  .post(
    '/',
    validateBody({
      emails: Joi.array().items(Joi.string().email()).required(),
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

module.exports = router;

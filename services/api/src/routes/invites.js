const mongoose = require('mongoose');
const Router = require('@koa/router');
const Joi = require('joi');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { Invite, User } = require('../models');

const { sendTemplatedMail } = require('../utils/mailer');
const { createTemporaryToken } = require('../utils/tokens');

const router = new Router();

function getToken(invite) {
  return createTemporaryToken({ type: 'invite', inviteId: invite._id, email: invite.email });
}

function sendInvite(sender, invite) {
  return sendTemplatedMail({
    to: invite.email,
    file: 'invite.md',
    sender,
    token: getToken(invite),
  });
}

router
  .param('inviteId', async (id, ctx, next) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ctx.throw(404);
    }
    const invite = await Invite.findById(id);
    if (!invite) {
      ctx.throw(404);
    }
    ctx.state.invite = invite;

    return next();
  })
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .use(requirePermissions({ endpoint: 'users', permission: 'read', scope: 'global' }))
  .post('/search', validateBody(Invite.getSearchValidation()), async (ctx) => {
    const { data, meta } = await Invite.search(ctx.request.body);
    ctx.body = {
      data,
      meta,
    };
  })
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
        if ((await User.countDocuments({ email, deleted: false })) > 0) {
          ctx.throw(400, `${email} is already a user.`);
        }
        const invite = await Invite.findOneAndUpdate(
          {
            email,
            status: 'invited',
          },
          { status: 'invited', deleted: false, email, $unset: { deletedAt: 1 } },
          {
            new: true,
            upsert: true,
          }
        );
        await sendInvite(authUser, invite);
      }
      ctx.status = 204;
    }
  )
  .post('/:inviteId/resend', async (ctx) => {
    const { invite, authUser } = ctx.state;
    await sendInvite(authUser, invite);
    ctx.status = 204;
  })
  .delete('/:inviteId', async (ctx) => {
    const { invite } = ctx.state;
    await invite.delete();
    ctx.status = 204;
  });

module.exports = router;

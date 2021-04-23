const Router = require('@koa/router');
const Joi = require('joi');
const validate = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { searchValidation, getSearchQuery, search } = require('../utils/search');
const { requirePermissions } = require('../utils/middleware/permissions');

const { NotFoundError, BadRequestError, GoneError } = require('../utils/errors');
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
    subject: `${sender.name} has invited you to join {{appName}}`,
    template: 'invite.md',
    sender,
    token: getToken(invite),
  });
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
    validate({
      body: Joi.object({
        ...searchValidation(),
      }),
    }),
    async (ctx) => {
      const { body } = ctx.request;
      const query = getSearchQuery(body);
      const { data, meta } = await search(Invite, query, body);
      ctx.body = {
        data,
        meta,
      };
    }
  )
  .use(requirePermissions({ endpoint: 'users', permission: 'write', scope: 'global' }))
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

const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { fetchByParam } = require('../utils/middleware/params');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
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
  .use(authenticate())
  .use(requirePermissions({ endpoint: 'users', permission: 'read', scope: 'global' }))
  .param('id', fetchByParam(Invite))
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
      emails: yd.array(yd.string().email()).required(),
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
  .post('/:id/resend', async (ctx) => {
    const { invite, authUser } = ctx.state;
    await sendInvite(authUser, invite);
    ctx.status = 204;
  })
  .delete('/:id', async (ctx) => {
    const { invite } = ctx.state;
    await invite.delete();
    ctx.status = 204;
  });

module.exports = router;

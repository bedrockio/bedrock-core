const Router = require('@koa/router');
const yd = require('@bedrockio/yada');
const { fetchByParam } = require('../utils/middleware/params');
const { validateBody } = require('../utils/middleware/validate');
const { validateToken } = require('../utils/middleware/tokens');
const { authenticate } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');

const { register } = require('../utils/auth');
const { createAuthToken } = require('../utils/auth/tokens');
const { Invite, User } = require('../models');

const mailer = require('../utils/messaging/mailer');
const { createInviteToken } = require('../utils/auth/tokens');

const router = new Router();

function sendInvite(sender, invite) {
  const token = createInviteToken(invite);
  return mailer.sendMail({
    to: invite.email,
    template: 'invite.md',
    sender,
    token,
  });
}

router
  .post(
    '/accept',
    validateBody({
      firstName: yd.string().required(),
      lastName: yd.string().required(),
      password: yd.string().password().required(),
    }),
    validateToken({ type: 'invite' }),
    async (ctx) => {
      const invite = await Invite.findOneAndUpdate(
        {
          email: ctx.state.jwt.sub,
        },
        {
          $set: { status: 'accepted' },
        }
      );
      if (!invite) {
        return ctx.throw(400, 'Invite could not be found');
      }

      let user = await User.findOne({
        email: invite.email,
      });

      if (user) {
        const token = createAuthToken(ctx, user);
        await user.save();
        ctx.body = {
          data: {
            token,
          },
        };
      } else {
        const { email, role } = invite;
        const user = new User({
          ...ctx.request.body,
          email,
          ...(role && {
            roles: [
              {
                scope: 'global',
                role,
              },
            ],
          }),
        });

        const token = await register(ctx, user);

        ctx.body = {
          data: {
            token,
          },
        };
      }
    }
  )
  .use(authenticate())
  .use(requirePermissions('users.read'))
  .param('id', fetchByParam(Invite))
  .post('/search', validateBody(Invite.getSearchValidation()), async (ctx) => {
    const { data, meta } = await Invite.search(ctx.request.body);
    ctx.body = {
      data,
      meta,
    };
  })
  .use(requirePermissions('users.invite'))
  .post(
    '/',
    validateBody({
      emails: yd.array(yd.string().email()).required(),
      role: yd.string(),
    }),
    async (ctx) => {
      const { authUser } = ctx.state;
      const { emails, role } = ctx.request.body;

      for (let email of [...new Set(emails)]) {
        if ((await User.countDocuments({ email, deleted: false })) > 0) {
          ctx.throw(400, `${email} is already a user.`);
        }
        const invite = await Invite.findOneAndUpdate(
          {
            email,
            status: 'invited',
          },
          {
            status: 'invited',
            deleted: false,
            email,
            role,
            $unset: { deletedAt: 1 },
          },
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

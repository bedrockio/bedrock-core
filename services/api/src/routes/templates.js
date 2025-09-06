const yd = require('@bedrockio/yada');
const Router = require('@koa/router');
const { fetchByParam } = require('../utils/middleware/params');
const { authenticate } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { validateBody, validateDelete } = require('../utils/middleware/validate');
const { sendMessage } = require('../utils/messaging');
const { getMailParams } = require('../utils/messaging/mail');
const { Template, User, AuditEntry } = require('../models');

const router = new Router();

// Loads some dummy conten for consumption in the templates.
// Adjust this as needed for the app.
async function getPreviewParams() {
  return {
    user: await User.findOne(),
  };
}

router
  .use(authenticate())
  .use(requirePermissions('templates'))
  .param('id', fetchByParam(Template))
  .post('/', validateBody(Template.getCreateValidation()), async (ctx) => {
    const template = await Template.create({
      ...ctx.request.body,
    });

    await AuditEntry.append('Created template', {
      ctx,
      object: template,
      fields: ['name', 'subject'],
    });

    ctx.body = {
      data: template,
    };
  })
  .get('/:id', async (ctx) => {
    const { template } = ctx.state;
    ctx.body = {
      data: template,
    };
  })
  .post('/search', validateBody(Template.getSearchValidation()), async (ctx) => {
    const params = ctx.request.body;
    const { data, meta } = await Template.search(params);

    ctx.body = {
      data,
      meta,
    };
  })
  .get('/:id/params', async (ctx) => {
    const params = await getPreviewParams();
    ctx.body = {
      data: params,
    };
  })
  .get('/:id/preview', async (ctx) => {
    const { template } = ctx.state;
    const params = await getPreviewParams();
    const result = await getMailParams({
      template: template.name,
      ...params,
    });
    ctx.body = {
      data: result,
    };
  })
  .post(
    '/:id/send',
    validateBody({
      email: yd.string().email(),
      phone: yd.string().phone(),
      userId: yd.string().mongo(),
      channel: yd.string().allow('email', 'sms', 'push').required(),
    }),
    async (ctx) => {
      const { template } = ctx.state;
      const { body } = ctx.request;
      const { channel, userId } = body;

      const params = await getPreviewParams();

      let user;
      if (channel === 'push') {
        user = await User.findById(userId);
        if (!user) {
          ctx.throw(400, 'User not found.');
        } else if (!user.deviceToken) {
          ctx.throw(400, 'User has not registered push notifications.');
        }
      }

      try {
        await sendMessage({
          ...body,
          ...params,
          template: template.name,
          user,
        });
      } catch (error) {
        ctx.throw(400, error);
      }

      ctx.status = 204;
    },
  )
  .post('/push-users/search', validateBody(User.getSearchValidation()), async (ctx) => {
    const { data, meta } = await User.search({
      ...ctx.request.body,
      deviceToken: {
        $exists: true,
      },
    });

    ctx.body = {
      data,
      meta,
    };
  })
  .patch('/:id', validateBody(Template.getUpdateValidation()), async (ctx) => {
    const { template } = ctx.state;
    const snapshot = new Template(template);

    template.assign(ctx.request.body);

    await template.save();

    await AuditEntry.append('Updated template', {
      ctx,
      object: template,
      fields: ['name', 'subject'],
      snapshot,
    });

    ctx.body = {
      data: template,
    };
  })
  .delete('/:id', validateDelete(Template.getDeleteValidation()), async (ctx) => {
    const { template } = ctx.state;
    try {
      await template.delete();
    } catch (err) {
      ctx.throw(400, err);
    }
    await AuditEntry.append('Deleted template', {
      ctx,
      object: template,
    });
    ctx.status = 204;
  });

module.exports = router;

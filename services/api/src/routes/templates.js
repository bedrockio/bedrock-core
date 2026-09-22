import yd from '@bedrockio/yada';
import Router from '@koa/router';
import { fetchByParam } from '../utils/middleware/params.js';
import { authenticate } from '../utils/middleware/authenticate.js';
import { requirePermissions } from '../utils/middleware/permissions.js';
import { validateBody, validateDelete } from '../utils/middleware/validate.js';
import { sendMessage } from '../utils/messaging/index.js';
import { getMailParams } from '../utils/messaging/mail.js';
import { Template, User, AuditEntry } from '../models/index.js';

const router = new Router();

// Loads some dummy content for consumption in the templates.
// Adjust this as needed for the app.
async function getPreviewParams() {
  return {
    user: await User.findOne(),
    sender: await User.findOne(),
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

    try {
      const result = await getMailParams({
        validate: true,
        template: template.name,
        ...params,
      });
      ctx.body = {
        data: result,
      };
    } catch (error) {
      ctx.throw(400, error);
    }
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
      const { email, phone, userId, channel } = body;

      const params = await getPreviewParams();

      let user;
      if (channel === 'email') {
        params.email = email;
      } else if (channel === 'phone') {
        params.phone = phone;
      } else if (channel === 'push') {
        user = await User.findById(userId);
        if (!user) {
          ctx.throw(400, 'User not found.');
        } else if (!user.deviceToken) {
          ctx.throw(400, 'User has not registered push notifications.');
        }
      }

      try {
        await sendMessage({
          ...params,
          template: template.name,
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

export default router;

const Router = require('@koa/router');
const { kebabCase } = require('lodash');

const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Application, ApplicationRequest, AuditEntry } = require('../models');
const { exportValidation, csvExport } = require('../utils/csv');
const { requirePermissions } = require('../utils/middleware/permissions');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .use(requirePermissions({ endpoint: 'applications', permission: 'read', scope: 'global' }))
  .param('application', async (id, ctx, next) => {
    const application = await Application.findOne({ _id: id, user: ctx.state.authUser.id });
    ctx.state.application = application;
    if (!application) {
      ctx.throw(404);
    }
    return next();
  })
  .post('/mine/search', validateBody(Application.getSearchValidation()), async (ctx) => {
    const { body } = ctx.request;
    const { data, meta } = await Application.search({
      ...body,
      user: ctx.state.authUser.id,
    });
    ctx.body = {
      data,
      meta,
    };
  })
  .post(
    '/:application/logs/search',
    validateBody(
      ApplicationRequest.getSearchValidation({
        ...exportValidation(),
      })
    ),
    async (ctx) => {
      const { format, filename, ...params } = ctx.request.body;
      const { application } = ctx.state;

      const { data, meta } = await ApplicationRequest.search({
        ...params,
        application: application.id,
      });

      if (format === 'csv') {
        return csvExport(ctx, data);
      }
      ctx.body = {
        data,
        meta,
      };
    }
  )
  .get('/:application', async (ctx) => {
    ctx.body = {
      data: ctx.state.application,
    };
  })
  .use(requirePermissions({ endpoint: 'applications', permission: 'write', scope: 'global' }))
  .post('/', validateBody(Application.getCreateValidation()), async (ctx) => {
    const { body } = ctx.request;
    const apiKey = kebabCase(body.name);
    const count = await Application.countDocuments({
      apiKey,
    });

    const application = await Application.create({
      ...body,
      apiKey: count ? `${apiKey}-${count}` : apiKey,
      user: ctx.state.authUser,
    });

    await AuditEntry.append('Created Application', ctx, {
      object: application,
      user: ctx.state.authUser,
    });

    ctx.body = {
      data: application,
    };
  })
  .patch('/:application', validateBody(Application.getUpdateValidation()), async (ctx) => {
    const application = ctx.state.application;
    application.assign(ctx.request.body);

    await application.save();

    await AuditEntry.append('Updated Application', ctx, {
      object: application,
      user: ctx.state.authUser,
      fields: ['name', 'description', 'apiKey'],
    });

    ctx.body = {
      data: application,
    };
  })
  .delete('/:application', async (ctx) => {
    await ctx.state.application.delete();
    ctx.status = 204;
  });

module.exports = router;

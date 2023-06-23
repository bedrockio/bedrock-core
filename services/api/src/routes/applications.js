const Router = require('@koa/router');
const { kebabCase } = require('lodash');
const { fetchByParam } = require('../utils/middleware/params');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const { Application, ApplicationRequest, AuditEntry } = require('../models');
const { exportValidation, csvExport } = require('../utils/csv');
const { requirePermissions } = require('../utils/middleware/permissions');

const router = new Router();

router
  .use(authenticate())
  .use(requirePermissions({ endpoint: 'applications', permission: 'read', scope: 'global' }))
  .param('id', fetchByParam(Application))
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
    '/:id/logs/search',
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
  .get('/:id', async (ctx) => {
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

    await AuditEntry.append('Created Application', {
      ctx,
      object: application,
    });
    console.log(!23132);

    ctx.body = {
      data: application,
    };
  })
  .patch('/:id', validateBody(Application.getUpdateValidation()), async (ctx) => {
    const application = ctx.state.application;
    const snapshot = new Application(application);

    application.assign(ctx.request.body);
    await application.save();

    await AuditEntry.append('Updated Application', {
      ctx,
      object: application,
      actor: ctx.state.authUser,
      fields: ['name', 'description', 'apiKey'],
      snapshot,
    });

    ctx.body = {
      data: application,
    };
  })
  .delete('/:id', async (ctx) => {
    await ctx.state.application.delete();
    ctx.status = 204;
  });

module.exports = router;

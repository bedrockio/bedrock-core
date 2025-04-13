const Router = require('@koa/router');
const { kebabCase } = require('lodash');
const { fetchByParam } = require('../utils/middleware/params');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate } = require('../utils/middleware/authenticate');
const { Application, AuditEntry } = require('../models');
const { requirePermissions } = require('../utils/middleware/permissions');

const router = new Router();

router
  .use(authenticate())
  .use(requirePermissions('applications.read'))
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
  .get('/:id', async (ctx) => {
    ctx.body = {
      data: ctx.state.application,
    };
  })
  .use(requirePermissions('applications.write'))
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

    await AuditEntry.append('Created application', {
      ctx,
      object: application,
      fields: ['name', 'user', 'apiKey'],
    });

    ctx.body = {
      data: application,
    };
  })
  .patch('/:id', validateBody(Application.getUpdateValidation()), async (ctx) => {
    const application = ctx.state.application;
    const snapshot = new Application(application);

    application.assign(ctx.request.body);
    await application.save();

    await AuditEntry.append('Updated application', {
      ctx,
      object: application,
      fields: ['name', 'user', 'apiKey'],
      snapshot,
    });

    ctx.body = {
      data: application,
    };
  })
  .delete('/:id', async (ctx) => {
    const application = ctx.state.application;
    await application.delete();
    await AuditEntry.append('Deleted application', {
      ctx,
      object: application,
    });
    ctx.status = 204;
  });

module.exports = router;

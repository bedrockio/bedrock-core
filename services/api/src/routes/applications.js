const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Application, ApplicationRequest } = require('../models');
const { kebabCase } = require('lodash');
const { exportValidation, csvExport } = require('../utils/csv');
const Joi = require('joi');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('application', async (id, ctx, next) => {
    const application = await Application.findOne({ _id: id, user: ctx.state.authUser.id });
    ctx.state.application = application;
    if (!application) {
      ctx.throw(404);
    }
    return next();
  })
  .post('/mine/search', async (ctx) => {
    const { body } = ctx.request;
    const { data, meta } = await Application.search({
      user: ctx.state.authUser.id,
      ...body,
    });
    ctx.body = {
      data,
      meta,
    };
  })
  .post('/', validateBody(Application.getCreateValidation()), async (ctx) => {
    const { body } = ctx.request;
    const clientId = kebabCase(body.name);
    const count = await Application.countDocuments({
      clientId,
    });

    const application = await Application.create({
      ...body,
      clientId: count ? `${clientId}-${count}` : clientId, // needs to be generated
      user: ctx.state.authUser,
    });

    ctx.body = {
      data: application,
    };
  })
  .post(
    '/:application/logs/search',
    validateBody(
      ApplicationRequest.getSearchValidation({
        ...exportValidation(),
        'request.method': Joi.string().uppercase(),
        'response.status': Joi.number(),
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
  .patch(
    '/:application',
    validateBody(
      Application.getUpdateValidation({
        clientId: Joi.strip(),
        requestCount: Joi.strip(),
      })
    ),
    async (ctx) => {
      const application = ctx.state.application;
      application.assign(ctx.request.body);
      await application.save();
      ctx.body = {
        data: application,
      };
    }
  )
  .delete('/:application', async (ctx) => {
    await ctx.state.application.delete();
    ctx.status = 204;
  });

module.exports = router;

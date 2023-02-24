const Router = require('@koa/router');
const { fetchByParam } = require('../utils/middleware/params');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { requirePermissions } = require('../utils/middleware/permissions');
const { Organization } = require('../models');

const router = new Router();

router
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .param('id', fetchByParam(Organization))
  .post('/mine/search', async (ctx) => {
    const { authUser } = ctx.state;
    const { body } = ctx.request;
    const ids = authUser.roles.filter((role) => role.scope === 'organization').map((role) => role.scopeRef);
    if (!ids.length) {
      ctx.body = {
        data: [],
        meta: {
          total: 0,
        },
      };
      return;
    }
    const { data, meta } = await Organization.search({
      ids,
      ...body,
    });
    ctx.body = {
      data,
      meta,
    };
  })
  .get('/:id', async (ctx) => {
    const organization = ctx.state.organization;
    ctx.body = {
      data: organization,
    };
  })
  .use(requirePermissions({ endpoint: 'organizations', permission: 'read', scope: 'global' }))
  .post('/search', validateBody(Organization.getSearchValidation()), async (ctx) => {
    const { data, meta } = await Organization.search(ctx.request.body);
    ctx.body = {
      data,
      meta,
    };
  })
  .use(requirePermissions({ endpoint: 'organizations', permission: 'write', scope: 'global' }))
  .post('/', validateBody(Organization.getCreateValidation()), async (ctx) => {
    const organization = await Organization.create(ctx.request.body);
    ctx.body = {
      data: organization,
    };
  })
  .patch('/:id', validateBody(Organization.getUpdateValidation()), async (ctx) => {
    const organization = ctx.state.organization;
    organization.assign(ctx.request.body);
    await organization.save();
    ctx.body = {
      data: organization,
    };
  })
  .delete('/:id', async (ctx) => {
    await ctx.state.organization.delete();
    ctx.status = 204;
  });

module.exports = router;

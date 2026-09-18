import Router from '@koa/router';
import { fetchByParam } from '../utils/middleware/params.js';
import { validateBody } from '../utils/middleware/validate.js';
import { authenticate } from '../utils/middleware/authenticate.js';
import { requirePermissions } from '../utils/middleware/permissions.js';
import { Organization } from '../models/index.js';

const router = new Router();

router
  .use(authenticate())
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
  .use(requirePermissions('organizations.read'))
  .post('/search', validateBody(Organization.getSearchValidation()), async (ctx) => {
    const { data, meta } = await Organization.search(ctx.request.body);
    ctx.body = {
      data,
      meta,
    };
  })
  .use(requirePermissions('organizations.write'))
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

export default router;

import Router from '@koa/router';
import { validateBody } from '../utils/middleware/validate.js';
import { authenticate } from '../utils/middleware/authenticate.js';
import { Category } from '../models/index.js';

const router = new Router();

router.use(authenticate()).post('/search', validateBody(Category.getSearchValidation()), async (ctx) => {
  const { data, meta } = await Category.search(ctx.request.body);
  ctx.body = {
    data,
    meta,
  };
});

export default router;

import Router from '@koa/router';
import User from '../models/user';

const router = new Router();

router
  .get('/', async (ctx) => {
    ctx.body = {
      success: true,
    };
  })
  .get('/mongodb', async (ctx) => {
    const numItems = await User.countDocuments({});
    ctx.body = {
      success: numItems > 0,
    };
  });

export default router;

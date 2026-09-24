import yd from '@bedrockio/yada';
import Router from '@koa/router';
import documentation from '../utils/documentation.js';
import { User } from '../models/index.js';

const router = new Router();

router
  .get(
    '/',
    documentation.include(
      documentation.description('Get Status', 'Reports whether the API is up.'),
      documentation.success(200, {
        schema: { success: yd.boolean() },
        example: { success: true },
      }),
    ),
    async (ctx) => {
      ctx.body = {
        success: true,
      };
    },
  )
  .get(
    '/mongodb',
    documentation.include(
      documentation.description('Get MongoDB Status', 'Reports whether the database is reachable and contains users.'),
      documentation.success(200, {
        schema: { success: yd.boolean() },
        example: { success: true },
      }),
    ),
    async (ctx) => {
      const numItems = await User.countDocuments({});
      ctx.body = {
        success: numItems > 0,
      };
    },
  );

export default router;

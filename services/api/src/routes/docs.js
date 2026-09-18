import yd from '@bedrockio/yada';
import Router from '@koa/router';
import { validateBody } from '../utils/middleware/validate.js';
import { set } from 'lodash-es';

import { loadDefinition, saveDefinition, generateDefinition } from '../utils/openapi.js';

const router = new Router();

router
  .patch(
    '/',
    validateBody({
      path: yd.array(yd.string()),
      value: yd.any(),
    }),
    async (ctx) => {
      let { path, value } = ctx.request.body;
      const definition = await loadDefinition();
      if (!path) {
        ctx.throw(400, 'Path required.');
      }
      if (value === null) {
        // Unset field using undefined here.
        value = undefined;
      }
      set(definition, path, value);
      await saveDefinition(definition);
      ctx.status = 204;
    }
  )
  .post('/generate', async (ctx) => {
    ctx.body = {
      data: await generateDefinition(),
    };
  });

export default router;

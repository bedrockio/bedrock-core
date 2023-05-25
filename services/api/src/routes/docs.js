const yd = require('@bedrockio/yada');
const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { set } = require('lodash');

const { loadDefinition, saveDefinition, generateDefinition } = require('../utils/openapi');

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

module.exports = router;

const Router = require('@koa/router');
const { authenticate } = require('../utils/middleware/authenticate');
const { Job } = require('../models');
const router = new Router();

router.use(authenticate()).get('/:id', async (ctx) => {
  // Query the raw fields directly — Agenda doesn't write through Mongoose.
  const job = await Job.findOne({
    _id: ctx.request.params.id,
    deleted: {
      $ne: true,
    },
  });
  ctx.body = {
    data: job,
  };
});

module.exports = router;

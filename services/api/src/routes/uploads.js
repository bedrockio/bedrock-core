const Router = require('@koa/router');
const { createReadStream } = require('fs');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Upload } = require('../models');
const { storeUploadedFile } = require('../utils/uploads');

const router = new Router();

router
  .param('uploadId', async (id, ctx, next) => {
    try {
      const upload = await Upload.findById(id);
      if (!upload) {
        ctx.throw(404);
      } else if (ctx.state.authUser.id != upload.owner) {
        ctx.throw(401);
      }
      ctx.state.upload = upload;
      return next();
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .get('/:id', async (ctx) => {
    const upload = await Upload.findById(ctx.params.id);
    ctx.body = {
      data: upload,
    };
  })
  .get('/:id/raw', async (ctx) => {
    const upload = await Upload.findById(ctx.params.id);
    const url = upload.rawUrl;
    if (upload.storageType === 'local') {
      ctx.set('Content-Type', upload.mimeType);
      ctx.body = createReadStream(url);
    } else {
      ctx.redirect(url);
    }
  })
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .post('/', async (ctx) => {
    const { authUser } = ctx.state;
    const file = ctx.request.files.file;
    const isArray = Array.isArray(file);
    const files = isArray ? file : [file];
    const uploads = await Promise.all(
      files.map(async (file) => {
        const params = await storeUploadedFile(file);
        params.owner = authUser.id;
        return await Upload.create(params);
      })
    );
    ctx.body = {
      data: uploads,
    };
  })
  .delete('/:uploadId', async (ctx) => {
    const { upload } = ctx.state;
    await upload.delete();
    ctx.status = 204;
  });

module.exports = router;

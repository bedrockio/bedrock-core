const Router = require('@koa/router');
const { createReadStream } = require('fs');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Upload } = require('../models');
const { storeUploadedFile } = require('../utils/uploads');

const router = new Router();

router
  .param('uploadId', async (id, ctx, next) => {
    const upload = await Upload.findById(id);
    ctx.state.upload = upload;

    if (!upload) {
      ctx.throw(404);
    } else if (ctx.state.authUser.id != upload.ownerId) {
      ctx.throw(401);
    }

    return next();
  })
  .get('/:hash', async (ctx) => {
    const upload = await Upload.findOne({ hash: ctx.params.hash });
    ctx.body = {
      data: upload,
    };
  })
  .get('/:hash/image', async (ctx) => {
    const { thumbnail } = ctx.request.query;
    const upload = await Upload.findOne({ hash: ctx.params.hash });
    const url = thumbnail && upload.thumbnailUrl ? upload.thumbnailUrl : upload.rawUrl;
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
        params.ownerId = authUser.id;
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

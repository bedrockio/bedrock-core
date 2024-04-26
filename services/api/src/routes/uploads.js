const Router = require('@koa/router');
const { createReadStream } = require('fs');
const { fetchByParam } = require('../utils/middleware/params');
const { authenticate } = require('../utils/middleware/authenticate');
const { validateFiles } = require('../utils/middleware/validate');
const { createUpload } = require('../utils/uploads');
const { Upload } = require('../models');

const router = new Router();

router
  .param(
    'id',
    fetchByParam(Upload, {
      hasAccess: (ctx, upload) => {
        if (ctx.method === 'GET') {
          return true;
        } else {
          return upload.owner?.equals(ctx.state.authUser.id);
        }
      },
    })
  )
  .get('/:id', async (ctx) => {
    const upload = await Upload.findById(ctx.params.id);
    ctx.body = {
      data: upload,
    };
  })
  .get('/:id/raw', async (ctx) => {
    const upload = await Upload.findById(ctx.params.id);
    if (!upload) return ctx.throw(404, 'Upload not found');
    const url = upload.rawUrl;
    if (upload.storageType === 'local') {
      ctx.set('Content-Type', upload.mimeType);
      ctx.body = createReadStream(url);
    } else {
      ctx.redirect(url);
    }
  })
  .use(authenticate())
  .post('/', validateFiles(), async (ctx) => {
    const { authUser } = ctx.state;
    const { file } = ctx.request.files;
    const files = Array.isArray(file) ? file : [file];
    const uploads = await Promise.all(
      files.map(async (file) => {
        return await createUpload(file, {
          owner: authUser,
        });
      })
    );
    ctx.body = {
      data: uploads,
    };
  })
  .delete('/:id', async (ctx) => {
    const { upload } = ctx.state;
    await upload.delete();
    ctx.status = 204;
  });

module.exports = router;

const fs = require('fs');

const Router = require('@koa/router');
const { fetchByParam } = require('../utils/middleware/params');
const { authenticate } = require('../utils/middleware/authenticate');
const { validateFiles } = require('../utils/middleware/validate');
const {
  createUploads,
  getUploadLocalPath,
  getUploadUrl,
  parseRange,
  validateAccess,
} = require('../utils/uploads');
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
    }),
  )
  .use(authenticate({ optional: true }))
  .get('/:id', async (ctx) => {
    const { upload } = ctx.state;
    validateAccess(ctx, upload);
    ctx.body = {
      data: upload,
    };
  })
  .get('/:id/url', async (ctx) => {
    const { upload, authUser } = ctx.state;
    validateAccess(ctx, upload);
    try {
      ctx.body = {
        data: await getUploadUrl(upload, {
          authUser,
        }),
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  })
  .get('/:id/raw', async (ctx) => {
    const { upload } = ctx.state;
    validateAccess(ctx, upload);

    const { storageType } = upload;

    if (storageType === 'gcs') {
      try {
        ctx.redirect(await getUploadUrl(upload));
      } catch (error) {
        ctx.throw(400, error);
      }
    } else if (storageType === 'local') {
      const filePath = getUploadLocalPath(upload);

      ctx.set('Accept-Ranges', 'bytes');
      ctx.set('Content-Type', upload.mimeType);
      ctx.set('Content-Disposition', `inline; filename="${upload.filename}"`);

      if (ctx.headers.range) {
        const { start, end, size } = await parseRange(ctx.headers.range, filePath);
        ctx.set('Content-Length', String(end - start + 1));
        ctx.set('Content-Range', `bytes ${start}-${end}/${size}`);
        ctx.body = fs.createReadStream(filePath, { start, end });
        ctx.status = 206;
      } else {
        ctx.body = fs.createReadStream(filePath);
      }
    }
  })
  .use(authenticate())
  .post('/', validateFiles(), async (ctx) => {
    const { file } = ctx.request.files;
    const { authUser } = ctx.state;
    try {
      const uploads = await createUploads(file, {
        owner: authUser,
      });
      ctx.body = {
        data: uploads,
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  })
  .post('/private', validateFiles(), async (ctx) => {
    const { file } = ctx.request.files;
    const { authUser } = ctx.state;
    try {
      const uploads = await createUploads(file, {
        owner: authUser,
        private: true,
      });
      ctx.body = {
        data: uploads,
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  })
  .delete('/:id', async (ctx) => {
    const { upload } = ctx.state;
    await upload.delete();
    ctx.status = 204;
  });

module.exports = router;

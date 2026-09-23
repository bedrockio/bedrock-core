import fs from 'fs';

import Router from '@koa/router';
import { fetchByParam } from '../utils/middleware/params.js';
import { authenticate } from '../utils/middleware/authenticate.js';
import { validateFiles, validateBody } from '../utils/middleware/validate.js';
import {
  createUploads,
  createResumableUpload,
  getUploadLocalPath,
  getUploadUrl,
  parseRange,
  validateAccess,
} from '../utils/uploads.js';
import { Upload } from '../models/index.js';

const router = new Router();

router
  .param(
    'id',
    fetchByParam(Upload, {
      hasAccess: (ctx, upload) => {
        if (ctx.method === 'GET') {
          return true;
        } else {
          return upload.user?.equals(ctx.state.authUser.id);
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
    const { upload } = ctx.state;
    validateAccess(ctx, upload);
    try {
      ctx.body = {
        data: await getUploadUrl(upload),
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
        user: authUser,
      });
      ctx.body = {
        data: uploads,
      };
    } catch (error) {
      ctx.throw(400, error);
    }
  })
  .post('/resumable', validateBody(Upload.getCreateValidation()), async (ctx) => {
    const { authUser } = ctx.state;

    try {
      const result = await createResumableUpload({
        ...ctx.request.body,
        user: authUser,
      });
      ctx.body = {
        data: result,
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
        user: authUser,
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

export default router;

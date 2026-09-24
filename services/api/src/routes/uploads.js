import fs from 'fs';

import Router from '@koa/router';
import yd from '@bedrockio/yada';
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
import documentation from '../utils/documentation.js';
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
  .get(
    '/:id/url',
    documentation.include(
      documentation.description(
        'Get Upload URL',
        'Returns a browser-usable URL for the file, signed or token-scoped when the upload is private.',
      ),
      documentation.success(200, {
        schema: { data: yd.string() },
        example: { data: 'https://api.example.com/1/uploads/64b7f0c2e4b0a1a2b3c4d5e6/raw' },
      }),
    ),
    async (ctx) => {
      const { upload } = ctx.state;
      validateAccess(ctx, upload);
      try {
        ctx.body = {
          data: await getUploadUrl(upload),
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
  )
  .get(
    '/:id/raw',
    documentation.include(
      documentation.description(
        'Get Upload File',
        'Serves the file bytes, or redirects to the storage URL for cloud-stored uploads.',
      ),
      documentation.success(200, {
        description: 'Full file contents for locally stored uploads.',
      }),
      documentation.success(206, {
        description: 'Requested byte range for locally stored uploads.',
      }),
      documentation.success(302, {
        description: 'Redirect to the storage URL for cloud-stored uploads.',
      }),
    ),
    async (ctx) => {
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
    },
  )
  .use(authenticate())
  .post(
    '/',
    validateFiles(),
    documentation.include(
      documentation.description('Create Uploads', 'Stores one or more files and returns an upload for each.'),
      documentation.success(200, {
        schema: { data: [Upload] },
      }),
    ),
    async (ctx) => {
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
    },
  )
  .post(
    '/resumable',
    validateBody(Upload.getCreateValidation()),
    documentation.include(
      documentation.description(
        'Create Resumable Upload',
        'Creates an upload and returns a storage session URL the client writes the file to directly.',
      ),
      documentation.success(200, {
        schema: { data: { url: yd.string(), upload: Upload } },
      }),
    ),
    async (ctx) => {
      const { authUser } = ctx.state;

      try {
        const result = await createResumableUpload({
          ...ctx.request.body,
          owner: authUser,
        });
        ctx.body = {
          data: result,
        };
      } catch (error) {
        ctx.throw(400, error);
      }
    },
  )
  .post(
    '/private',
    validateFiles(),
    documentation.include(
      documentation.description(
        'Create Private Uploads',
        'Stores one or more files readable only by permitted users and returns an upload for each.',
      ),
      documentation.success(200, {
        schema: { data: [Upload] },
      }),
    ),
    async (ctx) => {
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
    },
  )
  .delete('/:id', async (ctx) => {
    const { upload } = ctx.state;
    await upload.delete();
    ctx.status = 204;
  });

export default router;

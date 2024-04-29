const Router = require('@koa/router');
const { fetchByParam } = require('../utils/middleware/params');
const { authenticate } = require('../utils/middleware/authenticate');
const { validateFiles } = require('../utils/middleware/validate');
const { createUploads, getUploadUrl, createUrlStream } = require('../utils/uploads');
const { userHasAccess } = require('./../utils/permissions');
const { isEqual } = require('../utils/document');
const { Upload } = require('../models');

const router = new Router();

function validateAccess(ctx, upload) {
  if (!upload) {
    ctx.throw(404);
  }
  if (upload.private) {
    const { authUser } = ctx.state;
    let allowed;
    if (!authUser) {
      allowed = false;
    } else if (authUser.equals(upload.owner)) {
      allowed = true;
    } else {
      allowed = userHasAccess(authUser, {
        endpoint: 'uploads',
        permission: 'read',
        scope: 'global',
      });
    }

    if (!allowed) {
      ctx.throw(401, 'Cannot access upload.');
    }
  }
}

router
  .param(
    'id',
    fetchByParam(Upload, {
      hasAccess: (ctx, upload) => {
        if (ctx.method === 'GET') {
          return true;
        } else {
          return isEqual(upload.owner, ctx.state.authUser);
        }
      },
    })
  )
  .use(authenticate({ optional: true }))
  .get('/:id', async (ctx) => {
    const { upload } = ctx.state;
    validateAccess(ctx, upload);
    ctx.body = {
      data: upload,
    };
  })
  .get('/:id/raw', async (ctx) => {
    const { upload } = ctx.state;
    validateAccess(ctx, upload);

    try {
      const url = await getUploadUrl(upload);

      if (upload.storageType === 'gcs') {
        if (upload.private) {
          // Note that private images cannot be served via an <img> tag as this
          // will not send the Authorize header and so will not pass the above
          // validateAccess check.
          //
          // Additionally they cannot be redirected to as browser fetch requests
          // will strip the Origin header on redirect, which will result in the
          // cors access control headers being stripped from the response as the
          // bucket objects are private, which will result in a cors error.
          ctx.body = createUrlStream(url);
        } else {
          // Public images CAN be redirected to, however note that in order to be
          // loaded by a fetch request (as opposed to an <img> tag) the bucket must
          // have the correct cors configuration. This is particularly relevant for
          // flutter web in canvas mode, which uses the fetch API to load images. In
          // such an environment the bucket must be correctly configured.
          ctx.redirect(url);
        }
      } else {
        ctx.set('Content-Type', upload.mimeType);
        ctx.body = createUrlStream(url);
      }
    } catch (error) {
      ctx.throw(400, error);
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

const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Video } = require('../models');
const {
  getTranscodedVideoJobs,
  createVideoTranscodeJob,
  deleteVideoTranscodeJobs,
} = require('../lib/gcloud-video-transcoder');
const { createCloudflareStream } = require('../lib/cloudflare');
const { createMuxAsset, getMuxAssetStatus } = require('../lib/mux');
const { createVimeoUpload, getVimeoStatus } = require('../lib/vimeo');

const router = new Router();

router
  .param('videoId', async (id, ctx, next) => {
    try {
      const video = await Video.findById(id);
      if (!video) {
        ctx.throw(404);
      }
      ctx.state.video = video;
      return next();
    } catch (err) {
      ctx.throw(400, err);
    }
  })
  .get('/:videoId/status', async (ctx) => {
    const video = ctx.state.video;
    let status;
    if (video.provider === 'gcloud') {
      status = await getTranscodedVideoJobs(video);
    } else if (video.provider === 'mux') {
      status = await getMuxAssetStatus(video);
    } else if (video.provider === 'vimeo') {
      status = await getVimeoStatus(video);
    }
    ctx.body = {
      data: status,
    };
  })
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .post('/', validateBody(Video.getCreateValidation()), async (ctx) => {
    const video = await Video.create(ctx.request.body);
    if (video.provider === 'gcloud') {
      await createVideoTranscodeJob(video);
    } else if (video.provider === 'cloudflare') {
      await createCloudflareStream(video);
    } else if (video.provider === 'mux') {
      await createMuxAsset(video);
    } else if (video.provider === 'vimeo') {
      await createVimeoUpload(video);
    }
    ctx.body = {
      data: video,
    };
  })
  .get('/:videoId', async (ctx) => {
    const video = ctx.state.video;
    ctx.body = {
      data: video,
    };
  })
  .post('/search', validateBody(Video.getSearchValidation()), async (ctx) => {
    const { data, meta } = await Video.search(ctx.request.body);
    ctx.body = {
      data,
      meta,
    };
  })
  .patch('/:videoId', validateBody(Video.getUpdateValidation()), async (ctx) => {
    const video = ctx.state.video;
    video.assign(ctx.request.body);
    await video.save();
    ctx.body = {
      data: video,
    };
  })
  .delete('/:videoId', async (ctx) => {
    await ctx.state.video.delete();
    ctx.status = 204;
  })
  .post('/:videoId/transcode', async (ctx) => {
    const video = ctx.state.video;
    if (video.provider === 'gcloud') {
      await createVideoTranscodeJob(video);
    } else {
      const ret = await createCloudflareStream(video);
      console.info('TRANSCODE CLOUD FLARE', ret);
    }
    ctx.status = 204;
  })
  .delete('/:videoId/transcode', async (ctx) => {
    const video = ctx.state.video;
    if (video.provider === 'gcloud') {
      await deleteVideoTranscodeJobs(video);
    } else {
      console.info('CLOUD FLARE DELETE JOBS');
    }
    video.transcodeJobs = [];
    await video.save();
    ctx.status = 204;
  });

module.exports = router;

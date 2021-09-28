const Router = require('@koa/router');
const { validateBody } = require('../utils/middleware/validate');
const config = require('@bedrockio/config');
const { authenticate, fetchUser } = require('../utils/middleware/authenticate');
const { Video } = require('../models');

const router = new Router();

const path = require('path');

const { UPLOADS_GCS_BUCKET, GC_TRANSCODER_PROJECT, GC_TRANSCODER_LOCATION, GC_TRANSCODER_BUCKET } = config.getAll();

const { TranscoderServiceClient } = require('@google-cloud/video-transcoder').v1;
// Instantiates a client
const client = new TranscoderServiceClient();

async function createVideoTranscodeJob(video) {
  const ext = path.extname(video.upload.filename);
  const inputUri = `gs://${UPLOADS_GCS_BUCKET}/${video.upload.hash}${ext}`;
  const outputUri = `gs://${GC_TRANSCODER_BUCKET}/${video.id}/`;

  const request = {
    parent: client.locationPath(GC_TRANSCODER_PROJECT, GC_TRANSCODER_LOCATION),
    job: {
      inputUri: inputUri,
      outputUri: outputUri,
      config: {
        elementaryStreams: [
          {
            key: 'video-stream0',
            videoStream: {
              h264: {
                widthPixels: 640,
                bitrateBps: 2500000,
                frameRate: 30,
              },
            },
          },
          {
            key: 'video-stream1',
            videoStream: {
              h264: {
                widthPixels: 1280,
                bitrateBps: 5000000,
                frameRate: 30,
              },
            },
          },
          {
            key: 'video-stream2',
            videoStream: {
              h264: {
                widthPixels: 1920,
                bitrateBps: 8000000,
                frameRate: 30,
              },
            },
          },
          {
            key: 'audio-stream0',
            audioStream: {
              codec: 'aac',
              bitrateBps: 64000,
            },
          },
        ],
        muxStreams: [
          {
            key: 'video-ld',
            container: 'fmp4',
            elementaryStreams: ['video-stream0'],
          },
          {
            key: 'video-sd',
            container: 'fmp4',
            elementaryStreams: ['video-stream1'],
          },
          {
            key: 'video-hd',
            container: 'fmp4',
            elementaryStreams: ['video-stream2'],
          },
          {
            key: 'audio',
            container: 'fmp4',
            elementaryStreams: ['audio-stream0'],
          },
        ],
        manifests: [
          {
            fileName: 'manifest.m3u8',
            type: 'HLS',
            muxStreams: ['video-ld', 'video-sd', 'video-hd', 'audio'],
          },
          {
            fileName: 'manifest.mpd',
            type: 'DASH',
            muxStreams: ['video-ld', 'video-sd', 'video-hd', 'audio'],
          },
        ],
        spriteSheets: [
          {
            filePrefix: 'sprite-sheet',
            spriteWidthPixels: 128,
            columnCount: 10,
            interval: {
              seconds: '1',
            },
          },
        ],
      },
    },
  };
  const [response] = await client.createJob(request);
  console.info('OKKKKKKKKKKKKKKKK', response);
  video.transcodeJobs.push({
    name: response.name,
  });
  await video.save();
}

async function deleteVideoTranscodeJobs(video) {
  await Promise.all(
    video.transcodeJobs.map(async (job) => {
      return await deleteVideoTranscodeJob(job);
    })
  );
}

async function deleteVideoTranscodeJob(job) {
  const request = { name: job.name };
  await client.deleteJob(request);
}

// const { Storage } = require('@google-cloud/storage');

// async function getTranscodedVideoUrl(video) {
//   const storage = new Storage();
//   const bucket = storage.bucket(GC_TRANSCODER_BUCKET);
//   return bucket.file(`${video.id}/manifest.mpd`).publicUrl();
//   // const metaData = await file.getMetadata();
//   // console.info('fuckkkkkkkkkkkkkk', metaData);
//   // return metaData[0].selfLink;
// }

async function getTranscodedVideoJobs(video) {
  return await Promise.all(
    video.transcodeJobs.map(async (job) => {
      return await getTranscodedVideoJob(job);
    })
  );
}

async function getTranscodedVideoJob(job) {
  // projects/418630549680/locations/us-east1/jobs/f67f5721-e56d-45a7-a5f4-9a81addf9d66
  // Job: projects/418630549680/locations/us-central1/jobs/1dd28762-784a-4a6f-b992-813ad4998604
  // projects/418630549680/locations/us-east1/jobs/41fe3ee0-1eb3-4d5e-bde9-a0e19d911b8e
  // const jobId = 'f67f5721-e56d-45a7-a5f4-9a81addf9d66';
  // Construct request
  const request = {
    name: job.name,
    // name: transcoderServiceClient.jobPath(projectId, location, jobId),
  };
  const [response] = await client.getJob(request);
  console.info('hmm', response);
  return response;
}

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
  // .get('/:videoId/transcode', async (ctx) => {
  //   const video = ctx.state.video;
  //   ctx.redirect(await getTranscodedVideoUrl(video));
  // })
  .get('/:videoId/jobs', async (ctx) => {
    const video = ctx.state.video;
    console.info('wuttttttttt', video);
    ctx.body = {
      data: await getTranscodedVideoJobs(video),
    };
  })
  .use(authenticate({ type: 'user' }))
  .use(fetchUser)
  .post('/', validateBody(Video.getCreateValidation()), async (ctx) => {
    const video = await Video.create(ctx.request.body);
    await createVideoTranscodeJob(video);
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
    await createVideoTranscodeJob(video);
    ctx.status = 204;
  })
  .delete('/:videoId/transcode', async (ctx) => {
    const video = ctx.state.video;
    await deleteVideoTranscodeJobs(video);
    video.transcodeJobs = [];
    await video.save();
    ctx.status = 204;
  });

module.exports = router;

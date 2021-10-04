const path = require('path');
const config = require('@bedrockio/config');
const { TranscoderServiceClient } = require('@google-cloud/video-transcoder').v1;
const { UPLOADS_GCS_BUCKET, GC_TRANSCODER_PROJECT, GC_TRANSCODER_LOCATION, GC_TRANSCODER_BUCKET } = config.getAll();

// Instantiates a client
const client = new TranscoderServiceClient();

async function getTranscodedVideoJobs(video) {
  return await Promise.all(
    video.transcodeJobs.map(async (job) => {
      return await getTranscodedVideoJob(job);
    })
  );
}

async function getTranscodedVideoJob(job) {
  const request = {
    name: job.name,
  };
  const [response] = await client.getJob(request);
  return response;
}

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

module.exports = {
  getTranscodedVideoJob,
  getTranscodedVideoJobs,
  createVideoTranscodeJob,
  deleteVideoTranscodeJobs,
  deleteVideoTranscodeJob,
};

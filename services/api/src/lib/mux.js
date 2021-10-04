const path = require('path');
const Mux = require('@mux/mux-node');
const config = require('@bedrockio/config');
const { UPLOADS_GCS_BUCKET, MUX_TOKEN_ID, MUX_TOKEN_SECRET } = config.getAll();
const { Video } = new Mux(MUX_TOKEN_ID, MUX_TOKEN_SECRET);

async function createMuxAsset(video) {
  const ext = path.extname(video.upload.filename);
  const storageUrl = `https://storage.googleapis.com/${UPLOADS_GCS_BUCKET}/${video.upload.hash}${ext}`;
  const { id, playback_ids } = await Video.Assets.create({
    input: [
      {
        url: storageUrl,
      },
      ...video.captions
        .filter((caption) => {
          return caption.kind !== 'metadata';
        })
        .map((caption) => {
          const ext = path.extname(caption.upload.filename);
          const url = `https://storage.googleapis.com/${UPLOADS_GCS_BUCKET}/${caption.upload.hash}${ext}`;
          console.info('UMMMMMMMMMMMMMMMMMM', url);
          return {
            url,
            type: 'text',
            text_type: caption.kind,
            closed_captions: caption.kind === 'captions',
            language_code: caption.language,
          };
        }),
    ],
    playback_policy: 'public',
  });
  video.muxAssetId = id;
  video.muxPlaybackIds = playback_ids;

  console.info('wtf', video);
  await video.save();
}

async function getMuxAssetStatus(video) {
  console.info('wtf', video);
  return await Video.Assets.get(video.muxAssetId);
}

module.exports = {
  createMuxAsset,
  getMuxAssetStatus,
};

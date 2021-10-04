const path = require('path');
const fetch = require('node-fetch');
const config = require('@bedrockio/config');
const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, UPLOADS_GCS_BUCKET } = config.getAll();

// curl \
// -x post \
// -d '{"url":,"meta":{"name":"my first stream video"}}' \
// -h "authorization: bearer $token" \

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}`;

async function createCloudflareStream(video) {
  const ext = path.extname(video.upload.filename);
  // const inputUri = `gs://${UPLOADS_GCS_BUCKET}/${video.upload.hash}${ext}`;
  // const outputUri = `gs://${GC_TRANSCODER_BUCKET}/${video.id}/`;
  const url = `${BASE_URL}/stream/copy`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
    body: JSON.stringify({
      url: `https://storage.googleapis.com/${UPLOADS_GCS_BUCKET}/${video.upload.hash}${ext}`,
      meta: {
        name: video.name,
      },
    }),
  });
  const { success, result } = await res.json();
  if (success) {
    video.cloudflareId = result.uid;
    await video.save();
    await Promise.all(
      video.captions.map(async (caption) => {
        await createCaption(caption, video);
      })
    );
  } else {
    console.error(result);
    throw new Error('Fail!');
  }
}

async function createCaption(caption, video) {
  const url = `${BASE_URL}/${video.cloudflare_uid}/captions/${caption.language}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
    },
  });
  const foo = await res.text();
  console.info(foo);
}
// curl -X PUT \
//  -H 'Authorization: Bearer $TOKEN' \
//  -F file=@/Users/mickie/Desktop/example_caption.vtt \

module.exports = {
  createCloudflareStream,
};

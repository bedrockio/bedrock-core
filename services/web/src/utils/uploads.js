import { API_URL } from 'utils/env';

export function urlForUpload(upload, thumbnail = false) {
  const url = new URL(`/1/uploads/${upload.hash}/image`, API_URL);
  if (thumbnail) {
    url.search = new URLSearchParams({
      thumbnail: true
    });
  }
  return url.toString();
}

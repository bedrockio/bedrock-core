import { API_URL } from 'utils/env';

export function urlForUpload(upload, thumbnail = false) {
  let url = `/1/uploads/${upload.hash}/image`;
  if (thumbnail) {
    url += '?thumbnail=true';
  }
  return new URL(url, API_URL).toString();
}

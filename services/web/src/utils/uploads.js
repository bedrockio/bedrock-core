import { API_URL } from 'utils/env';

export function urlForUpload(upload, thumbnail = false) {
  let url = `${API_URL}/1/uploads/${upload.hash}/image`;
  if (thumbnail) url += '?thumbnail=true';
  return url;
}

import { API_URL } from 'utils/env/client';

export function urlForUpload(upload, thumbnail = false) {
  let url = `${API_URL}1/uploads/${upload.hash}/image`;
  if (thumbnail) url += '?thumnail=true';
  return url;
}

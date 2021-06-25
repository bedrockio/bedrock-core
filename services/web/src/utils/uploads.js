import { API_URL } from 'utils/env';

export function urlForUpload(upload) {
  const url = `/1/uploads/${upload.id || upload}/image`;
  return new URL(url, API_URL).toString();
}

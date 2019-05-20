import config from 'config';

export function urlForUpload(upload, thumbnail = false) {
  let url = `${config.API_URL}1/uploads/${upload.hash}/image`;
  if (thumbnail) url += '?thumnail=true';
  return url;
}

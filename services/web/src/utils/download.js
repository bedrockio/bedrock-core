import { getToken } from './api/token';
import { API_URL } from './env';

const FILENAME_REG = /filename="(.+)"/;

export async function downloadAsFile(url, options) {
  let response;
  if (url.includes(API_URL)) {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  } else {
    response = await fetch(url);
  }
  await downloadResponse(response, options);
}

export async function downloadResponse(response, options = {}) {
  let { filename, openInline } = options;

  const blob = await response.blob();

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);

  filename ||= getFilename(response);

  if (openInline) {
    a.target = '_blank';
  } else {
    a.download = filename;
  }

  a.click();
  a.remove();
}

function getFilename(response) {
  const type = response.headers.get('content-type');
  const disposition = response.headers.get('content-disposition');

  let filename;
  if (disposition) {
    filename = disposition?.match(FILENAME_REG)?.[1];
  }
  if (!filename) {
    const ext = type?.split('/')[1];
    filename = 'file';
    if (ext) {
      filename += `.${ext}`;
    }
  }
  return filename;
}

import { escapeQoutes } from './utils/escape';
export default function templateCurl({
  method,
  url,
  file,
  headers = {},
  body = {},
}) {
  const code = [];
  code.push(`curl "${url}" -X ${method}`);

  if (file) {
    code.push(`  -F file=@path-to-file-you-want-to-upload`);
    Object.keys(body).forEach((key) => {
      code.push(`  -F ${escapeQoutes(key)}=${escapeQoutes(body[key])}`);
    });
    // headers goes last otherwise file upload doesnt work
    Object.keys(headers).forEach((key) => {
      code.push(`  -H "${escapeQoutes(key)}: ${escapeQoutes(headers[key])}"`);
    });
  } else {
    Object.keys(headers).forEach((key) => {
      code.push(`  -H "${escapeQoutes(key)}: ${escapeQoutes(headers[key])}"`);
    });
    if (Object.keys(body).length) {
      code.push(`  -d "${JSON.stringify(body).replace(/"/g, '\\"')}"`);
    }
  }
  return code.join('\\\n');
}

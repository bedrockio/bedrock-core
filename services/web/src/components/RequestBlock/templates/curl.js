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
    code.push(`  -F file=@pathtofile`);
    Object.keys(body).forEach((key) => {
      code.push(`  -F ${key}=${body[key]}`);
    });
    // headers goes last otherwise file upload doesnt work
    Object.keys(headers).forEach((key) => {
      code.push(`  -H "${key}: ${headers[key]}"`);
    });
  } else {
    Object.keys(headers).forEach((key) => {
      code.push(`  -H "${key}: ${headers[key]}"`);
    });
    if (body) {
      code.push(`  -d ${JSON.stringify(body)}`);
    }
  }
  return code.join('\\\n');
}

export default function templateFetch({ url, file, body, ...rest }) {
  const code = [];
  if (file) {
    code.push('const form = new FormData();');
    code.push('form.append("file", new Blob(["file data"]));');
    if (body) {
      for (let [key, value] of Object.entries(body || {})) {
        code.push(
          `form.append("${key}", ${
            typeof value === 'string' ? `"${value}"` : value
          })`
        );
      }
    }
    code.push('');
    code.push(`const options = ${JSON.stringify(rest, null, 2)}`);
    code.push('options.body = form;');
    code.push('');
  } else {
    code.push(`const options = ${JSON.stringify(rest, null, 2)}`);
  }
  code.push(`fetch("${url}", options)`);
  code.push('  .then((response) => response.json())');
  code.push('  .then((response) => console.log(response))');
  code.push('  .then((error) => console.error(error));');
  return code.join('\n');
}

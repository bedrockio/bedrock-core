const JSON_TEMPLATE = `
const url = '%url%';

const { data, meta } = await fetch(url, {
  method: '%method%',
  headers: {
    'Api-Key': '%apiKey%',
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json',
  },
  body: %body%
})
`;

const FORM_TEMPLATE = `
const url = '%url%';

const data = new FormData();
data.append('file', blob);

const { data, meta } = await fetch(url, {
  method: '%method%',
  headers: {
    'Api-Key': '%apiKey%',
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json',
  },
  body
})
`;

const TEMPLATE_REG = /%(\w+)%/g;

export default function templateFetch(props) {
  let code = props.file ? FORM_TEMPLATE : JSON_TEMPLATE;
  code = code
    .replace(TEMPLATE_REG, (match, token) => {
      let value = props[token];
      if (value && typeof value === 'object') {
        value = JSON.stringify(value, null, 2).replace(/^/gm, '  ').trim();
      }
      return value || 'UNKNOWN';
    })
    .trim();
  return code;
}

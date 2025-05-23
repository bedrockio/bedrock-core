const FORM_TEMPLATE = `
curl '%url%' \\
  -X '%method%' \\
  -H 'Api-Key: %apiKey%' \\
  -H 'Authorization: Bearer <token>' \\
  -H 'Content-Type: application/json' \\
  -F 'file: <PATH_TO_FILE>' \\
  %body%
`;

const JSON_TEMPLATE = `
curl '%url%' \\
  -X '%method%' \\
  -H 'Api-Key: <apiKey>' \\
  -H 'Authorization: Bearer <token>' \\
  -H 'Content-Type: application/json' \\
  --data-raw $'%body%'
`;

const TEMPLATE_REG = /%(\w+)%/g;

export default function templateCurl(props) {
  let code;

  if (props.file) {
    code = FORM_TEMPLATE.replace(TEMPLATE_REG, (match, token) => {
      let value = props[token];
      if (token === 'body') {
        value = Object.entries(value).map(([key, value]) => {
          return `-F ${quotes(key)}=${quotes(value)}`;
        });
      }
      return value || 'UNKNOWN';
    }).trim();
  } else {
    code = JSON_TEMPLATE.replace(TEMPLATE_REG, (match, token) => {
      let value = props[token];
      if (value && typeof value === 'object') {
        value = quotes(JSON.stringify(value));
      }
      return value || 'UNKNOWN';
    }).trim();
  }
  return code;
}

function quotes(str) {
  str = str.replace(/"/g, '\\"');
  str = str.replace(/'/g, "\\'");
  return str;
}

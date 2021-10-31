import { flatten, template } from 'lodash';
import { getToken } from 'utils/api';
import * as env from 'utils/env';

function formatTypeSummary(schema) {
  if (!schema) return 'unknown';
  if (schema.type === 'array' && schema.items && schema.items.type) {
    return `[]${schema.items.type}`;
  }
  return schema.type;
}

class OpenApiMacros {
  constructor(openApi) {
    this.openApi = openApi;
    this.paths = flatten(openApi.map((module) => module.paths || []));
    this.objects = flatten(openApi.map((module) => module.objects || []));
  }

  callHeading = ({ method, path }) => {
    return `#### \`${method} ${path}\``;
  };

  callParams = ({ method, path }) => {
    const definition = this.paths.find(
      (d) => d.method === method && d.path === path
    );
    if (!definition) return `\`Could not find API call for ${method} ${path}\``;
    const parameterType = definition.requestBody
      ? 'JSON Body'
      : 'Request Query';
    let markdown = [
      `${parameterType} Parameters:\n`,
      '| Key | Type | Required | Description |',
      '|--|--|--|--|',
    ];
    const params = definition.requestBody || definition.requestQuery || [];
    if (!params || !params.length) return '';
    params.forEach(({ name, schema, required, description }) => {
      const typeStr = formatTypeSummary(schema);
      const requiredStr = required ? 'Yes' : 'No';
      let descriptionStr = description || '';
      if (schema.default) {
        descriptionStr += ` (Default: ${JSON.stringify(schema.default)})`;
      }
      markdown.push(
        `|\`${name}\`|${typeStr}|${requiredStr}|${descriptionStr}|`
      );
    });
    return markdown.join('\n');
  };

  callResponse = ({ method, path }) => {
    const definition = this.paths.find(
      (d) => d.method === method && d.path === path
    );
    if (!definition) return `\`Could not find API call for ${method} ${path}\``;
    const { responseBody } = definition;
    if (!responseBody || !responseBody.length) return '';
    let markdown = [
      `\nResponse Body:\n`,
      '| Key | Type | Description |',
      '|--|--|--|',
    ];
    responseBody.forEach(({ name, schema, description }) => {
      const typeStr = formatTypeSummary(schema);
      let descriptionStr = description || '';
      if (schema && schema.default) {
        descriptionStr += ` (Default: ${JSON.stringify(schema.default)})`;
      }
      markdown.push(`|\`${name}\`|${typeStr}|${descriptionStr}|`);
    });
    return markdown.join('\n');
  };

  callExamples = ({ method, path }) => {
    const definition = this.paths.find(
      (d) => d.method === method && d.path === path
    );
    if (!definition) return `\`Could not find API call for ${method} ${path}\``;
    const { examples } = definition;
    if (!examples || !examples.length) return '';
    const markdown = [];
    examples.forEach(({ name, requestPath, requestBody, responseBody }) => {
      markdown.push(`\n#### Example: ${name || ''}`);
      if (method === 'GET') {
        markdown.push(`Request:\n`);
        markdown.push('```bash\nGET ' + path + '\n```');
      } else {
        markdown.push(
          `Request Body for \`${method} ${requestPath || path}\`\n`
        );
        markdown.push(
          '```json\n' + JSON.stringify(requestBody || {}, null, 2) + '\n```'
        );
      }
      if (responseBody) {
        markdown.push(`Response Body:\n`);
        markdown.push(
          '```json\n' + JSON.stringify(responseBody, null, 2) + '\n```\n'
        );
      }
    });
    return markdown.join('\n');
  };

  callSummary = ({ method, path }) => {
    const markdown = [];
    markdown.push(this.callHeading({ method, path }));
    markdown.push(this.callParams({ method, path }));
    const responseMd = this.callResponse({ method, path });
    if (responseMd) {
      markdown.push(responseMd);
    }
    const examplesMd = this.callExamples({ method, path });
    if (examplesMd) {
      markdown.push(examplesMd);
    }
    return markdown.join('\n');
  };

  objectSummary = ({ name }) => {
    const definition = this.objects.find((d) => d.name === name);
    if (!definition) return `\`Could not find object for ${name}\``;
    let markdown = [
      `Attributes:\n`,
      '| Key | Type | Always Set? | Description |',
      '|--|--|--|--|',
    ];
    const { attributes } = definition;
    attributes.forEach(({ name, schema, required, description }) => {
      const typeStr = formatTypeSummary(schema);
      let descriptionStr = description || '';
      if (schema.type === 'object' && schema.properties) {
        descriptionStr += '<br />';
        descriptionStr += '<br />';
        descriptionStr += this.buildNestedTable(
          ['Property', 'Type', 'Description'],
          Object.entries(schema.properties).map(([key, val]) => {
            const { type, description } = val;
            return [key, type, description || 'foo'];
          })
        );
      }
      const requiredStr = required ? 'Yes' : 'No';
      markdown.push(
        `|\`${name}\`|${typeStr}|${requiredStr}|${descriptionStr}|`
      );
    });
    return markdown.join('\n');
  };

  buildNestedTable(headerCells, bodyRows) {
    function wrap(tag, arr, fn) {
      return arr
        .map((el) => {
          if (fn) {
            el = fn(el);
          }
          return `<${tag}>${el}</${tag}>`;
        })
        .join('');
    }
    return html`
      <table>
        <thead>
          <tr>
            ${wrap('th', headerCells)}
          </tr>
        </thead>
        <tbody>
          ${wrap('tr', bodyRows, (cells) => {
            return wrap('td', cells);
          })}
          <tr></tr>
        </tbody>
      </table>
    `;
  }
}

export function enrichMarkdown(markdown, options) {
  const { openApi, organization } = options;
  const macros = new OpenApiMacros(openApi);
  return template(markdown)({
    ...env,
    ...macros,
    API_TOKEN: getToken(),
    ORGANIZATION_ID: organization?.id,
  });
}

function html(chunks, ...args) {
  return chunks
    .map((chunk, i) => {
      return chunk.trim() + (args[i] || '');
    })
    .join('')
    .trim()
    .replace(/\s*\n\s*/g, '');
}

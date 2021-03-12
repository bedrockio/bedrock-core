import { API_URL, APP_NAME } from 'utils/env';
import { flatten } from 'lodash';

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
  callHeading({ method, path }) {
    return `#### \`${method} ${path}\``;
  }
  callParams({ method, path }) {
    const definition = this.paths.find((d) => d.method === method && d.path === path);
    if (!definition) return `\`Could not find API call for ${method} ${path}\``;
    const parameterType = definition.requestBody ? 'JSON Body' : 'Request Query';
    let markdown = [`${parameterType} Parameters:\n`, '| Key | Type | Required | Description |', '|--|--|--|--|'];
    const params = definition.requestBody || definition.requestQuery || [];
    if (!params || !params.length) return '';
    params.forEach(({ name, schema, required, description }) => {
      const typeStr = formatTypeSummary(schema);
      const requiredStr = required ? 'Yes' : 'No';
      let descriptionStr = description || '';
      if (schema.default) {
        descriptionStr += ` (Default: ${JSON.stringify(schema.default)})`;
      }
      markdown.push(`|\`${name}\`|${typeStr}|${requiredStr}|${descriptionStr}|`);
    });
    return markdown.join('\n');
  }
  callResponse({ method, path }) {
    const definition = this.paths.find((d) => d.method === method && d.path === path);
    if (!definition) return `\`Could not find API call for ${method} ${path}\``;
    const { responseBody } = definition;
    if (!responseBody || !responseBody.length) return '';
    let markdown = [`\nResponse Body:\n`, '| Key | Type | Description |', '|--|--|--|'];
    responseBody.forEach(({ name, schema, description }) => {
      const typeStr = formatTypeSummary(schema);
      let descriptionStr = description || '';
      if (schema && schema.default) {
        descriptionStr += ` (Default: ${JSON.stringify(schema.default)})`;
      }
      markdown.push(`|\`${name}\`|${typeStr}|${descriptionStr}|`);
    });
    return markdown.join('\n');
  }
  callExamples({ method, path }) {
    const definition = this.paths.find((d) => d.method === method && d.path === path);
    if (!definition) return `\`Could not find API call for ${method} ${path}\``;
    const { examples } = definition;
    if (!examples || !examples.length) return '';
    const markdown = [];
    examples.forEach(({ name, requestPath, requestBody, responseBody }) => {
      markdown.push(`\n#### Example: ${name || ''}`);
      if (method === 'GET') {
        markdown.push(`Request:\n`);
        markdown.push('```\nGET ' + path + '\n```');
      } else {
        markdown.push(`Request Body for \`${method} ${requestPath || path}\`\n`);
        markdown.push('```json\n' + JSON.stringify(requestBody || {}, null, 2) + '\n```');
      }
      if (responseBody) {
        markdown.push(`Response Body:\n`);
        markdown.push('```json\n' + JSON.stringify(responseBody, null, 2) + '\n```\n');
      }
    });
    return markdown.join('\n');
  }
  callSummary({ method, path }) {
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
  }
  objectSummary({ name }) {
    const definition = this.objects.find((d) => d.name === name);
    if (!definition) return `\`Could not find object for ${name}\``;
    let markdown = [`Attributes:\n`, '| Key | Type | Always Set? | Description |', '|--|--|--|--|'];
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
      markdown.push(`|\`${name}\`|${typeStr}|${requiredStr}|${descriptionStr}|`);
    });
    return markdown.join('\n');
  }

  buildNestedTable(headerCells, bodyRows) {

    function wrap(tag, arr, fn) {
      return arr.map((el) => {
        if (fn) {
          el = fn(el);
        }
        return `<${tag}>${el}</${tag}>`;
      }).join('');
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
        <tr>
        </tr>
      </tbody>
      </table>
    `;
  }
}

export function executeOpenApiMacros(openApi, markdown) {
  // eslint-disable-next-line
  const macros = new OpenApiMacros(openApi);
  Object.getOwnPropertyNames(OpenApiMacros.prototype).forEach((macroFn) => {
    const key = macroFn.toString();
    const re = new RegExp(key + '\\(' + '[^)]+' + '\\)', 'gm');
    const matches = markdown.match(re);
    matches &&
      matches.forEach((match) => {
        const result = eval(`macros.${match}`);
        markdown = markdown.replace(match, result);
      });
  });
  return markdown;
}

export function enrichMarkdown(markdown, credentials, organization) {
  let enrichedMarkdown = markdown;
  if (organization) {
    enrichedMarkdown = enrichedMarkdown.replace(new RegExp('<ORGANIZATION_ID>', 'g'), organization.id);
  }
  if (credentials && credentials.length) {
    enrichedMarkdown = enrichedMarkdown.replace(new RegExp('<TOKEN>', 'g'), credentials[0].apiToken);
  }
  enrichedMarkdown = enrichedMarkdown.replace(new RegExp('<API_URL>', 'g'), API_URL.replace(/\/$/, ''));
  enrichedMarkdown = enrichedMarkdown.replace(new RegExp('<APP_NAME>', 'g'), APP_NAME.replace(/\/$/, ''));
  return enrichedMarkdown;
}

function html(chunks, ...args) {
  return chunks.map((chunk, i) => {
    return chunk.trim() + (args[i] || '');
  }).join('').trim().replace(/\s*\n\s*/g, '');
}

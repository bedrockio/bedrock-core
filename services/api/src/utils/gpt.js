const fs = require('fs/promises');
const path = require('path');
const OpenAI = require('openai');
const Mustache = require('mustache');
const config = require('@bedrockio/config');
const { memoize } = require('lodash');

const openai = new OpenAI({
  apiKey: config.get('OPENAI_API_KEY'),
});

const TEMPLATE_DIR = path.join(__dirname, '../gpt');
const MESSAGES_REG = /(?:^|\n)-{3,}\s*(\w+)\s*-{3,}(.*?)(?=\n-{3,}|$)/gs;
const JSON_REG = /([{[].+[}\]])/s;

const MODEL = 'gpt-4o';

async function prompt(options) {
  const messages = await getMessages(options);
  return await runCompletion(messages, options);
}

async function getMessages(options) {
  const { file, output, ...rest } = options;
  const template = await loadTemplate(file);

  const raw = Mustache.render(template, transformParams(rest));

  const messages = [];
  for (let match of raw.matchAll(MESSAGES_REG)) {
    const [, role, content] = match;
    messages.push({
      role: role.toLowerCase(),
      content: content.trim(),
    });
  }

  return messages;
}

function transformParams(params) {
  const result = {};
  for (let [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value = value
        .map((el) => {
          return `- ${el}`;
        })
        .join('\n');
    } else if (typeof value === 'object') {
      value = JSON.stringify(value, null, 2);
    }
    result[key] = value;
  }
  return result;
}

async function runCompletion(messages, options) {
  const { output = 'json' } = options;

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages,
  });

  let content = response.choices[0].message.content;

  if (output === 'raw') {
    return response;
  } else if (output === 'text') {
    return content;
  } else if (output === 'messages') {
    const { message } = response.choices[0];
    return [...messages, message];
  } else if (output === 'json') {
    try {
      const match = content.match(JSON_REG);
      return JSON.parse(match[1]);
    } catch (error) {
      throw new Error('Unable to derive JSON object in response.');
    }
  }
}

const loadTemplate = memoize(async (file) => {
  if (!file.endsWith('.md')) {
    file += '.md';
  }
  return await fs.readFile(path.join(TEMPLATE_DIR, file), 'utf8');
});

module.exports = {
  prompt,
};

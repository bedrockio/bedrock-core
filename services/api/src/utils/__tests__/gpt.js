const { prompt } = require('../gpt');
const { setResponse } = require('openai');

const responseLong = require('../__fixtures__/gpt-response-long.json');
const responseFormatted = require('../__fixtures__/gpt-response-formatted.json');
const responseUnformatted = require('../__fixtures__/gpt-response-unformatted.json');
const responseArrayUnformatted = require('../__fixtures__/gpt-response-array-unformatted.json');

describe('prompt', () => {
  it('should succeed for a long response', async () => {
    setResponse(responseLong);
    const result = await prompt({
      file: 'classify-fruits',
      text: 'I had a burger and some french fries for dinner. For dessert I had a banana.',
    });
    expect(result).toEqual({
      name: 'banana',
      color: 'yellow',
      calories: 105,
    });
  });

  it('should succeed for a formatted response', async () => {
    setResponse(responseFormatted);
    const result = await prompt({
      file: 'classify-fruits',
      text: 'I had a burger and some french fries for dinner. For dessert I had a banana.',
    });
    expect(result).toEqual({
      name: 'banana',
      color: 'yellow',
      calories: 105,
    });
  });

  it('should succeed for an unformatted response', async () => {
    setResponse(responseUnformatted);
    const result = await prompt({
      file: 'classify-fruits',
      text: 'I had a burger and some french fries for dinner. For dessert I had a banana.',
    });
    expect(result).toEqual({
      name: 'banana',
      color: 'yellow',
      calories: 105,
    });
  });

  it('should succeed for an array response', async () => {
    setResponse(responseArrayUnformatted);
    const result = await prompt({
      file: 'classify-fruits',
      text: 'I had a burger and some french fries for dinner. For dessert I had a banana.',
    });
    expect(result).toEqual([
      {
        name: 'banana',
        color: 'yellow',
        calories: 105,
      },
    ]);
  });

  it('should be able to return all messages', async () => {
    setResponse(responseArrayUnformatted);
    const result = await prompt({
      file: 'classify-fruits',
      text: 'I had a burger and some french fries for dinner. For dessert I had a banana.',
      output: 'messages',
    });
    expect(result).toEqual([
      {
        role: 'system',
        content: 'You are a helpful assistant.\n\nHere is a list of fruits:',
      },
      {
        role: 'user',
        content:
          'The following text describes someone eating a meal. Please determine which fruits were eaten and return a JSON array\n' +
          'containing objects with the following structure. Only output JSON, do not include any explanations.\n' +
          '\n' +
          '- "name" - The name of the fruit.\n' +
          '- "color" - The typical color of the fruit.\n' +
          '- "calories" - A rough estimate of the number of calories per serving. For example if the fruit is an "apple", provide\n' +
          '  the rough estimate of calories for a single apple.\n' +
          '\n' +
          'Text:\n' +
          '\n' +
          'I had a burger and some french fries for dinner. For dessert I had a banana.',
      },
      {
        role: 'assistant',
        content: '[{\n"name": "banana",\n  "color": "yellow",\n  "calories": 105\n}]',
      },
    ]);
  });

  it('should be able to output just the text', async () => {
    setResponse(responseArrayUnformatted);
    const result = await prompt({
      file: 'classify-fruits',
      text: 'I had a burger and some french fries for dinner. For dessert I had a banana.',
      output: 'text',
    });
    expect(result).toBe('[{\n"name": "banana",\n  "color": "yellow",\n  "calories": 105\n}]');
  });

  it('should be able to output the raw response', async () => {
    setResponse(responseArrayUnformatted);
    const result = await prompt({
      file: 'classify-fruits',
      text: 'I had a burger and some french fries for dinner. For dessert I had a banana.',
      output: 'raw',
    });
    expect(result).toEqual({
      id: 'chatcmpl-9dy8si0kRlF27OZiDtA4Y38u4lfO1',
      object: 'chat.completion',
      created: 1719313006,
      model: 'gpt-4o-2024-05-13',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: '[{\n"name": "banana",\n  "color": "yellow",\n  "calories": 105\n}]',
          },
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 134,
        completion_tokens: 79,
        total_tokens: 213,
      },
      system_fingerprint: 'fp_3e7d703517',
    });
  });
});

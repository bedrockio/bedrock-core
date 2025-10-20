const config = require('@bedrockio/config');
const { Template } = require('../models');
const { createUpload } = require('./testing');
const { renderTemplate } = require('./templates');
const { mockTime, unmockTime } = require('./testing/time');

const APP_NAME = config.get('APP_NAME');
const API_URL = config.get('API_URL');

describe('renderTemplate', () => {
  it('should render a raw template', async () => {
    const result = await renderTemplate({
      template: 'Hello {{name}}',
      params: {
        name: 'Frank',
      },
    });

    expect(result.body).toBe('Hello Frank');
  });

  it('should render a template from file', async () => {
    const fs = require('fs');

    jest.spyOn(fs, 'readFileSync').mockImplementation((file) => {
      if (file.endsWith('mock.md')) {
        return 'Hello from mock, {{name}}';
      }
    });

    const result = await renderTemplate({
      dir: 'mocks',
      template: 'mock',
      params: {
        name: 'Frank',
      },
    });

    expect(result.body).toBe('Hello from mock, Frank');

    jest.restoreAllMocks();
  });

  it('should render a template from document', async () => {
    await Template.create({
      name: 'doc',
      email: 'Hello from doc, {{name}}',
    });

    const result = await renderTemplate({
      channel: 'email',
      template: 'doc',
      params: {
        name: 'Frank',
      },
    });

    expect(result.body).toBe('Hello from doc, Frank');
  });

  it('should be able to pass a raw template with channel', async () => {
    const result = await renderTemplate({
      template: 'Hello',
      channel: 'email',
    });

    expect(result.body).toBe('Hello');
  });

  describe('helpers', () => {
    it('should render date', async () => {
      mockTime('2025-01-01T12:00:00.000Z');

      const result = await renderTemplate({
        template: 'Today is: {{date}}',
      });

      expect(result.body).toBe('Today is: 2025-01-01');

      unmockTime();
    });

    it('should render an image URL', async () => {
      const upload = await createUpload();

      const result = await renderTemplate({
        template: '{{imageUrl upload}}',
        params: {
          upload,
        },
      });

      expect(result.body).toBe(`${API_URL}/cdn-cgi/image/1/uploads/${upload.id}/raw`);
    });

    it('should render a basic HTML image', async () => {
      const upload = await createUpload();

      const result = await renderTemplate({
        template: '{{image upload}}',
        params: {
          upload,
        },
      });

      const url = `${API_URL}/cdn-cgi/image/1/uploads/${upload.id}/raw`;
      expect(result.body).toBe(`<img src="${url}" alt="test.png" />`);
    });

    it('should render a transformed HTML image', async () => {
      const upload = await createUpload();

      const result = await renderTemplate({
        template: '{{image upload width="50" height="50"}}',
        params: {
          upload,
        },
      });

      const url = `${API_URL}/cdn-cgi/image/height=50,width=50/1/uploads/${upload.id}/raw`;
      expect(result.body).toBe(`<img src="${url}" alt="test.png" width="50" height="50" />`);
    });
  });

  describe('params', () => {
    it('should render current year in any template', async () => {
      mockTime('2025-01-01T12:00:00.000Z');

      const result = await renderTemplate({
        template: 'This year is: {{currentYear}}',
      });

      expect(result.body).toBe('This year is: 2025');

      unmockTime();
    });

    it('should include public env', async () => {
      const result = await renderTemplate({
        template: 'The app is: {{APP_NAME}}',
      });

      expect(result.body).toBe(`The app is: ${APP_NAME}`);
    });
  });
});

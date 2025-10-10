const { request, createUser, createAdmin, createTemplate } = require('../utils/testing');
const { Template } = require('../models');

describe('/1/templates', () => {
  describe('POST /', () => {
    it('should create template', async () => {
      const user = await createAdmin();
      const response = await request(
        'POST',
        '/1/templates',
        {
          name: 'template name',
          channels: ['email', 'sms', 'push'],
          email: 'email',
          sms: 'sms',
          push: 'push',
        },
        { user },
      );
      const data = response.body.data;
      expect(response).toHaveStatus(200);
      expect(data.name).toBe('template name');
    });
  });

  describe('GET /:template', () => {
    it('should access template', async () => {
      const user = await createAdmin();
      const template = await createTemplate({
        name: 'new template',
      });
      const response = await request('GET', `/1/templates/${template.id}`, {}, { user });
      expect(response).toHaveStatus(200);
      expect(response.body.data.name).toBe(template.name);
    });
  });

  describe('POST /search', () => {
    it('should search templates', async () => {
      const user = await createAdmin();
      const template1 = await createTemplate({
        name: 'test template 1',
        subject: 'subject 1',
        body: 'body 1',
      });
      const template2 = await createTemplate({
        name: 'test template 2',
        subject: 'subject 2',
        body: 'body 2',
      });

      const response = await request(
        'POST',
        '/1/templates/search',
        {
          sort: {
            field: 'name',
            order: 'asc',
          },
        },
        { user },
      );

      expect(response).toHaveStatus(200);
      const body = response.body;
      expect(body.data[0].name).toBe(template1.name);
      expect(body.data[1].name).toBe(template2.name);
      expect(body.meta.total).toBe(2);
    });
  });

  describe('POST /:template/preview', () => {
    it('should preview template', async () => {
      const user = await createAdmin();
      await createUser();

      const template = await createTemplate({
        email: `
---
subject: Hello
---
{{user.name}}
        `.trim(),
      });
      const response = await request('GET', `/1/templates/${template.id}/preview`, {}, { user });
      expect(response).toHaveStatus(200);
      expect(response.body.data.subject).toBe('Hello');
      expect(response.body.data.body).toBe('Test User');
    });
  });

  describe('PATCH /:template', () => {
    it('should update template as admin', async () => {
      const admin = await createAdmin();
      let template = await createTemplate();
      const response = await request(
        'PATCH',
        `/1/templates/${template.id}`,
        {
          name: 'updated name',
        },
        { user: admin },
      );
      expect(response).toHaveStatus(200);
      expect(response.body.data.name).toBe('updated name');
      template = await Template.findById(template.id);
      expect(template.name).toEqual('updated name');
    });
  });

  describe('DELETE /:template', () => {
    it('should allow admin to delete template', async () => {
      const admin = await createAdmin();
      let template = await createTemplate({
        name: 'test template',
      });
      const response = await request('DELETE', `/1/templates/${template.id}`, {}, { user: admin });
      expect(response).toHaveStatus(204);
      template = await Template.findByIdDeleted(template.id);
      expect(template.deletedAt).toBeDefined();
    });
  });
});

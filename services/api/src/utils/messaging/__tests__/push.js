const { assertPushSent } = require('firebase-admin');
const { createUser, createUpload, createTemplate } = require('../../testing');
const { getImageUrl } = require('../../images');
const { sendPush } = require('../push');

const welcomeTemplate = `
Welcome!
`;

const escapeTemplate = `
{{body}}
`;

const fullTemplate = `
---
title: "Title!"
image: "Image!"
---
Hello!
`;

const interpolatedTemplate = `
Hello {{fullName}}. Welcome to {{{url}}}.
`;

jest.mock('fs/promises', () => ({
  readFile: async (file) => {
    if (file.endsWith('full.txt')) {
      return fullTemplate.trim();
    } else if (file.endsWith('welcome.txt')) {
      return welcomeTemplate.trim();
    } else if (file.endsWith('escape.txt')) {
      return escapeTemplate.trim();
    } else if (file.endsWith('interpolated.txt')) {
      return interpolatedTemplate.trim();
    } else {
      throw new Error('File not found.');
    }
  },
}));

describe('sendPush', () => {
  describe('with options', () => {
    it('should send out a push notification with body', async () => {
      const user = await createUser();
      await sendPush({
        user,
        body: 'Hello!',
      });
      assertPushSent({
        user,
        body: 'Hello!',
      });
    });

    it('should allow interpolation in title', async () => {
      const user = await createUser();
      await sendPush({
        user,
        title: 'Hi, {{user.name}}!',
      });
      assertPushSent({
        user,
        title: 'Hi, Test User!',
      });
    });

    it('should be able to interpolate an upload to an image URL', async () => {
      const upload = await createUpload();
      const user = await createUser();
      user.profileImage = upload;
      await sendPush({
        user,
        image: '{{imageUrl user.profileImage}}',
      });

      assertPushSent({
        user,
        imageUrl: getImageUrl(upload),
      });
    });
  });

  describe('with document', () => {
    it('should send a templated push', async () => {
      const user = await createUser();
      await createTemplate({
        name: 'test',
        push: 'Hello {{user.name}}!',
      });

      await sendPush({
        user,
        template: 'test',
      });

      assertPushSent({
        user,
        body: 'Hello Test User',
      });
    });

    it('should load meta from template body', async () => {
      const user = await createUser();
      await createTemplate({
        name: 'full',
        push: fullTemplate,
      });

      await sendPush({
        user,
        template: 'full',
      });

      assertPushSent({
        user,
        body: 'Hello!',
        title: 'Title!',
        imageUrl: 'Image!',
      });
    });
  });

  describe('with file', () => {
    it('should send push with file', async () => {
      const user = await createUser();
      await sendPush({
        user,
        file: 'welcome.txt',
      });
      assertPushSent({
        user,
        body: 'Welcome!',
      });
    });

    it('should interpolate variables in template', async () => {
      const user = await createUser();
      await sendPush({
        user,
        body: 'Hello!',
        url: 'https://foo.com',
        fullName: 'Marlon Brando',
        file: 'interpolated.txt',
      });
      assertPushSent({
        user,
        body: 'Hello Marlon Brando. Welcome to https://foo.com.',
      });
    });

    it('should assume an extension for a template', async () => {
      const user = await createUser();
      await sendPush({
        user,
        file: 'welcome',
      });
      assertPushSent({
        user,
        body: 'Welcome!',
      });
    });

    it('should not escape apostrophes', async () => {
      const user = await createUser();
      await sendPush({
        user,
        file: 'escape.txt',
        body: "It's me!",
      });
      assertPushSent({
        user,
        body: "It's me!",
      });
    });

    it('should load meta', async () => {
      const user = await createUser();
      await sendPush({
        user,
        file: 'full.txt',
      });
      assertPushSent({
        user,
        title: 'Title!',
        body: 'Hello!',
      });
    });
  });
});

const path = require('path');
const { assertPushSent } = require('firebase-admin');
const { createUser, createUpload, createTemplate } = require('../testing');
const { getImageUrl } = require('../images');
const { sendPush } = require('./push');

beforeEach(() => {
  mockFiles();
});

afterEach(() => {
  jest.restoreAllMocks();
});

const mocks = {
  // Basic template
  'welcome.txt': 'Welcome!',

  // Basic injected template
  'body.txt': '{{body}}',

  // Template with interpolated params
  'interpolated.txt': 'Hello {{fullName}}. Welcome to {{{url}}}.',

  // Template with metadata
  'meta.txt': `
---
title: "Title!"
image: "Image!"
---
Hello!
  `,
};

function mockFiles() {
  const fs = require('fs');
  const readFileSync = fs.readFileSync;
  jest.spyOn(fs, 'readFileSync').mockImplementation((...args) => {
    const filename = path.basename(args[0]);
    const value = mocks[filename];
    if (value) {
      return value;
    }
    return readFileSync(...args);
  });
}

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

    it('should send with just a title', async () => {
      const user = await createUser();
      await sendPush({
        user,
        title: 'Hello!',
      });
      assertPushSent({
        user,
        title: 'Hello!',
      });
    });

    it('should send with just an image', async () => {
      const upload = await createUpload();
      const user = await createUser();
      user.profileImage = upload;
      const url = getImageUrl(upload);

      await sendPush({
        user,
        image: url,
      });

      assertPushSent({
        user,
        imageUrl: url,
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
        body: 'Hello Test User!',
      });
    });

    it('should load meta from template body', async () => {
      const user = await createUser();
      await createTemplate({
        name: 'full',
        push: `
---
title: "Title!"
image: "Image!"
---
Hello!
        `,
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
        template: 'welcome.txt',
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
        template: 'interpolated.txt',
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
        template: 'welcome',
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
        template: 'body.txt',
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
        template: 'meta.txt',
      });
      assertPushSent({
        user,
        title: 'Title!',
        body: 'Hello!',
      });
    });
  });
});

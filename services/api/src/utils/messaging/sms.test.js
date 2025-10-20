const path = require('path');
const { sendSms } = require('./sms');
const { assertSmsSent } = require('twilio');
const { createUser, createTemplate } = require('../testing');

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

describe('sendSms', () => {
  describe('with options', () => {
    it('should send out a basic sms with body', async () => {
      await sendSms({
        phone: '+11111111111',
        body: 'Hello!',
      });
      assertSmsSent({
        phone: '+11111111111',
        body: 'Hello!',
      });
    });
  });

  describe('with document', () => {
    it('should send a templated push', async () => {
      const user = await createUser({
        phone: '+11111111111',
      });
      await createTemplate({
        name: 'test',
        sms: 'Hello {{user.name}}!',
      });

      await sendSms({
        user,
        template: 'test',
      });

      assertSmsSent({
        phone: user.phone,
        body: 'Hello Test User!',
      });
    });
  });

  describe('with file', () => {
    it('send out sms with template', async () => {
      await sendSms({
        phone: '+11111111111',
        template: 'welcome.txt',
      });
      assertSmsSent({
        phone: '+11111111111',
        body: 'Welcome!',
      });
    });

    it('should interpolate variables in template', async () => {
      await sendSms({
        phone: '+11111111111',
        body: 'Hello!',
        url: 'https://foo.com',
        fullName: 'Marlon Brando',
        template: 'interpolated.txt',
      });
      assertSmsSent({
        phone: '+11111111111',
        body: 'Hello Marlon Brando. Welcome to https://foo.com.',
      });
    });

    it('should assume an extension for a template', async () => {
      await sendSms({
        phone: '+11111111111',
        template: 'welcome',
      });
      assertSmsSent({
        phone: '+11111111111',
        body: 'Welcome!',
      });
    });

    it('should not escape apostrophes', async () => {
      await sendSms({
        phone: '+11111111111',
        template: 'body.txt',
        body: "It's me!",
      });
      assertSmsSent({
        phone: '+11111111111',
        body: "It's me!",
      });
    });
  });

  describe('other', () => {
    it('should be able to send an sms to a user without to', async () => {
      const phone = '+11111111111';
      const user = await createUser({
        phone,
      });
      await sendSms({
        user,
        body: 'Hello!',
      });
      assertSmsSent({
        phone,
        body: 'Hello!',
      });
    });
  });
});

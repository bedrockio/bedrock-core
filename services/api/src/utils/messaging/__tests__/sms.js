const { sendMessage } = require('../sms');
const { assertSmsSent } = require('twilio');
const { createUser } = require('../../testing');

const welcomeTemplate = `
Welcome!
`;

const escapeTemplate = `
{{body}}
`;

const interpolatedTemplate = `
Hello {{fullName}}. Welcome to {{&url}}.
`;

jest.mock('fs/promises', () => ({
  readFile: async (file) => {
    if (file.endsWith('welcome.txt')) {
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

describe('sendMessage', () => {
  describe('without template', () => {
    it('should send out a basic sms with body', async () => {
      await sendMessage({
        to: '+11111111111',
        body: 'Hello!',
      });
      assertSmsSent({
        to: '+11111111111',
        body: 'Hello!',
      });
    });
  });

  describe('with template', () => {
    it('send out sms with template', async () => {
      await sendMessage({
        to: '+11111111111',
        template: 'welcome.txt',
      });
      assertSmsSent({
        to: '+11111111111',
        body: 'Welcome!',
      });
    });

    it('should interpolate variables in template', async () => {
      await sendMessage({
        to: '+11111111111',
        body: 'Hello!',
        url: 'https://foo.com',
        fullName: 'Marlon Brando',
        template: 'interpolated.txt',
      });
      assertSmsSent({
        to: '+11111111111',
        body: 'Hello Marlon Brando. Welcome to https://foo.com.',
      });
    });

    it('should assume an extension for a template', async () => {
      await sendMessage({
        to: '+11111111111',
        template: 'welcome',
      });
      assertSmsSent({
        to: '+11111111111',
        body: 'Welcome!',
      });
    });

    it('should not escape apostrophes', async () => {
      await sendMessage({
        to: '+11111111111',
        template: 'escape.txt',
        body: "It's me!",
      });
      assertSmsSent({
        to: '+11111111111',
        body: "It's me!",
      });
    });
  });

  describe('other', () => {
    it('should be able to send an sms to a user without to', async () => {
      const user = await createUser({
        phone: '+11111111111',
      });
      await sendMessage({
        user,
        body: 'Hello!',
      });
      assertSmsSent({
        to: user.phone,
        body: 'Hello!',
      });
    });
  });
});

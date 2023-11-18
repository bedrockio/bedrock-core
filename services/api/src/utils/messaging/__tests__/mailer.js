const { sendMail } = require('../mailer');
const { assertMailSent } = require('postmark');
const { createUser } = require('../../testing');

const welcomeTemplate = `
Welcome!
`;

const subjectTemplate = `
---
subject: "Hello {{name}}!"
---
Welcome!
`;

const linkTemplate = `
I'm a [link](http://example.com) inside the body.
`;

const layout = `<body>{{&content}}</body>`;

const fullLayout = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style type="text/css" rel="stylesheet" media="all">
      p {
        color: #51545e;
      }
    </style>
  </head>
  <body>
    {{&content}}
  </body>
</html>
`;

jest.mock('fs/promises', () => ({
  readFile: async (file) => {
    if (file.endsWith('layout.html')) {
      return layout;
    } else if (file.endsWith('full.html')) {
      return fullLayout;
    } else if (file.endsWith('welcome.md')) {
      return welcomeTemplate.trim();
    } else if (file.endsWith('with-subject.md')) {
      return subjectTemplate.trim();
    } else if (file.endsWith('link.md')) {
      return linkTemplate.trim();
    } else {
      throw new Error('File not found.');
    }
  },
}));

describe('sendMail', () => {
  describe('without template', () => {
    it('should send out a basic mail', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        body: 'Hello!',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        body: 'Hello!',
        subject: '',
      });
    });

    it('should send out a mail with a subject', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        subject: 'Welcome',
        body: 'Hello!',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        subject: 'Welcome',
        body: 'Hello!',
      });
    });

    it('should not touch URLs in text body', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        body: 'Hello! http://foo.com',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        text: 'Hello! http://foo.com',
      });
    });

    it('should convert markdown in text body', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        body: '**[foo](http://foo.com)**',
        layout: 'full.html',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        text: 'foo (http://foo.com)',
      });
    });

    it('should convert single paragraph links to buttons', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        body: '**[foo](http://foo.com)**',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        html: '<body><p><strong><a href="http://foo.com" class="button" target="_blank"><span class="text">foo</span></a></strong></p></body>',
      });
    });
  });

  describe('with template', () => {
    it('should send out a templated mail', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        template: 'welcome.md',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        body: 'Welcome!',
      });
    });

    it('should be able to specify the subject with frontmatter', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        name: 'Marlon',
        template: 'with-subject.md',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        text: 'Welcome!',
        subject: 'Hello Marlon!',
      });
    });

    it('should convert html body to plain text', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        template: 'link.md',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        text: "I'm a link (http://example.com) inside the body.",
      });
    });

    it('should be able to assert on the text body', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        template: 'link.md',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        body: "I'm a [link](http://example.com) inside the body.",
      });
    });

    it('should assume an extension for a template', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        template: 'welcome',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        body: 'Welcome!',
      });
    });

    it('should escape brackets', async () => {
      await sendMail({
        to: 'marlon@brando.com',
        body: '2 > 1',
      });
      assertMailSent({
        to: 'marlon@brando.com',
        body: '2 &gt; 1',
      });
    });
  });

  describe('other', () => {
    it('should be able to send a mail to a user without to', async () => {
      const user = await createUser();
      await sendMail({
        user,
        body: 'Hello!',
      });
      assertMailSent({
        to: user.email,
        body: 'Hello!',
      });
    });

    it('should be able to send a mail to multiple users', async () => {
      const user1 = await createUser();
      const user2 = await createUser();
      await sendMail({
        users: [user1, user2],
        body: 'Hello!',
      });
      assertMailSent({
        to: `${user1.email},${user2.email}`,
        body: 'Hello!',
      });
    });
  });
});

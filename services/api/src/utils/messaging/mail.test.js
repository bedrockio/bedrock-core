const config = require('@bedrockio/config');
const { assertMailSent, assertMailCount } = require('postmark');
const { createUser, createUpload, createTemplate } = require('../testing');
const { getImageUrl } = require('../images');
const { sendMail } = require('./mail');

const APP_NAME = config.get('APP_NAME');

const welcomeTemplate = `
Welcome!
`;

const subjectTemplate = `
---
subject: "Hello {{user.name}}!"
---
Welcome!
`;

const linkTemplate = `
I'm a [link](http://example.com) inside the body.
`;

const layout = `<body>{{{content}}}</body>`;

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
    {{{content}}}
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
  describe('with options', () => {
    it('should send out a basic mail', async () => {
      await sendMail({
        email: 'marlon@brando.com',
        body: 'Hello!',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        body: 'Hello!',
        subject: '',
      });
    });

    it('should send out a mail with a subject', async () => {
      await sendMail({
        email: 'marlon@brando.com',
        subject: 'Welcome',
        body: 'Hello!',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        subject: 'Welcome',
        body: 'Hello!',
      });
    });

    it('should not touch URLs in text body', async () => {
      await sendMail({
        email: 'marlon@brando.com',
        body: 'Hello! http://foo.com',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        text: 'Hello! http://foo.com',
      });
    });

    it('should convert markdown in text body', async () => {
      await sendMail({
        email: 'marlon@brando.com',
        body: '**[foo](http://foo.com)**',
        layout: 'full.html',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        text: 'foo (http://foo.com)',
      });
    });
  });

  describe('with template document', () => {
    it('should send out a templated mail', async () => {
      const user = await createUser();
      await createTemplate({
        name: 'test',
        email: 'Hello {{user.name}}!',
      });
      await sendMail({
        user,
        email: 'marlon@brando.com',
        template: 'test',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        body: 'Hello Test User!',
      });
    });

    it('should load meta from template body', async () => {
      const user = await createUser();
      await createTemplate({
        name: 'test',
        email: subjectTemplate,
      });
      await sendMail({
        user,
        email: 'marlon@brando.com',
        template: 'test',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        subject: 'Hello Test User!',
        body: 'Welcome!',
      });
    });
  });

  describe('with file', () => {
    it('should send out a templated mail', async () => {
      await sendMail({
        email: 'marlon@brando.com',
        file: 'welcome.md',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        body: 'Welcome!',
      });
    });

    it('should specify the subject with frontmatter', async () => {
      const user = await createUser();
      await sendMail({
        user,
        email: 'marlon@brando.com',
        file: 'with-subject.md',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        text: 'Welcome!',
        subject: 'Hello Test User!',
      });
    });

    it('should convert html body to plain text', async () => {
      await sendMail({
        email: 'marlon@brando.com',
        file: 'link.md',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        text: "I'm a link (http://example.com) inside the body.",
      });
    });

    it('should assert on the text body', async () => {
      await sendMail({
        email: 'marlon@brando.com',
        file: 'link.md',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        body: "I'm a [link](http://example.com) inside the body.",
      });
    });

    it('should assume an extension for a template file', async () => {
      await sendMail({
        email: 'marlon@brando.com',
        file: 'welcome',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        body: 'Welcome!',
      });
    });
  });

  describe('templates', () => {
    describe('conditionals', () => {
      const body = `
Hello {{user.name}}!

{{#if author}}
Author: {{author.name}}
{{/if}}
      `.trim();

      it('should include conditional block', async () => {
        const user = await createUser();
        await sendMail({
          user,
          body,
          author: {
            name: 'Joe',
          },
        });

        assertMailSent({
          email: user.email,
          html: '<body><p>Hello Test User!</p>\n<p>Author: Joe</p></body>',
        });
      });

      it('should exclude conditional block', async () => {
        const user = await createUser();
        await sendMail({
          user,
          body,
        });

        assertMailSent({
          email: user.email,
          html: '<body><p>Hello Test User!</p></body>',
        });
      });
    });

    describe('looping', () => {
      it('should allow a non-zero-index to be output for arrays', async () => {
        const body = `
      {{number}}
{{#each users}}
Author {{number}}: {{name}}
{{/each}}
      `.trim();
        const user = await createUser();
        await sendMail({
          user,
          body,
          users: [
            {
              name: 'Frank',
            },
            {
              name: 'Dennis',
            },
          ],
        });

        assertMailSent({
          email: user.email,
          html: '<body><p>Author 1: Frank\nAuthor 2: Dennis</p></body>',
        });
      });
    });

    describe('images', () => {
      it('should build an image URL', async () => {
        const user = await createUser();
        const upload = await createUpload();

        await sendMail({
          user,
          body: '{{{image upload}}}',
          upload,
        });

        const url = getImageUrl(upload);

        assertMailSent({
          email: user.email,
          html: `<body><p><img src="${url}" alt="test.png"></p></body>`,
        });
      });

      it('should override default params', async () => {
        const user = await createUser();
        const upload = await createUpload();

        await sendMail({
          user,
          body: '{{image upload fit="crop"}}',
          upload,
        });

        const url = getImageUrl(upload, {
          fit: 'crop',
        });

        assertMailSent({
          email: user.email,
          html: `<body><p><img src="${url}" alt="test.png"></p></body>`,
        });
      });

      it('should add extra params', async () => {
        const user = await createUser();
        const upload = await createUpload();

        await sendMail({
          user,
          body: '{{image upload fit="crop" blur=50}}',
          upload,
        });
        const url = getImageUrl(upload, {
          blur: 50,
          fit: 'crop',
        });

        assertMailSent({
          email: user.email,
          html: `<body><p><img src="${url}" alt="test.png"></p></body>`,
        });
      });

      it('should return an empty string when no argument passed', async () => {
        const user = await createUser();

        await sendMail({
          user,
          body: '{{image upload}}',
        });

        assertMailSent({
          email: user.email,
          html: '<body></body>',
        });
      });

      it('should allow type alias', async () => {
        const user = await createUser();
        const upload = await createUpload();

        await sendMail({
          user,
          body: '{{image upload type="avatar"}}',
          upload,
        });
        const url = getImageUrl(upload, {
          height: 150,
        });

        assertMailSent({
          email: user.email,
          html: `<body><p><img src="${url}" alt="test.png" height="150"></p></body>`,
        });
      });

      it('should support picking the first off an array', async () => {
        const user = await createUser();
        const upload = await createUpload();

        await sendMail({
          user,
          body: '{{image uploads}}',
          uploads: [upload],
        });
        const url = getImageUrl(upload);

        assertMailSent({
          email: user.email,
          html: `<body><p><img src="${url}" alt="test.png"></p></body>`,
        });
      });

      it('should set alt text', async () => {
        const user = await createUser();
        const upload = await createUpload();

        await sendMail({
          user,
          body: '{{image uploads alt="Hello"}}',
          uploads: [upload],
        });
        const url = getImageUrl(upload);

        assertMailSent({
          email: user.email,
          html: `<body><p><img src="${url}" alt="Hello"></p></body>`,
        });
      });
    });

    describe('links', () => {
      it('should handle relative URLs', async () => {
        await sendMail({
          email: 'marlon@brando.com',
          body: '{{link text="Click" url="/foo"}}',
        });
        assertMailSent({
          email: 'marlon@brando.com',
          html: '<body><p><a href="http://localhost:2200/foo" target="_blank">Click</a></p></body>',
        });
      });
    });

    describe('buttons', () => {
      it('should generate a button by arguments', async () => {
        await sendMail({
          email: 'marlon@brando.com',
          body: '{{button "Click" "http://example.com"}}',
        });
        assertMailSent({
          email: 'marlon@brando.com',
          html: '<body><p><a href="http://example.com" class="button" target="_blank">Click</a></p></body>',
        });
      });

      it('should generate a button by named', async () => {
        await sendMail({
          email: 'marlon@brando.com',
          body: '{{button text="Click" url="http://example.com"}}',
        });
        assertMailSent({
          email: 'marlon@brando.com',
          html: '<body><p><a href="http://example.com" class="button" target="_blank">Click</a></p></body>',
        });
      });

      it('should handle relative URLs', async () => {
        await sendMail({
          email: 'marlon@brando.com',
          body: '{{button text="Click" url="/foo"}}',
        });
        assertMailSent({
          email: 'marlon@brando.com',
          html: '<body><p><a href="http://localhost:2200/foo" class="button" target="_blank">Click</a></p></body>',
        });
      });

      it('should inject URL params', async () => {
        await sendMail({
          email: 'marlon@brando.com',
          body: '{{button text="Click" url="/foo/:one/bar/:two" one="123" two="456"}}',
        });
        assertMailSent({
          email: 'marlon@brando.com',
          html: '<body><p><a href="http://localhost:2200/foo/123/bar/456" class="button" target="_blank">Click</a></p></body>',
        });
      });
    });

    describe('date', () => {
      it('should format a date', async () => {
        await sendMail({
          email: 'marlon@brando.com',
          body: 'Start: {{date start}}',
          start: '2025-03-21T00:00:00.000Z',
        });
        assertMailSent({
          email: 'marlon@brando.com',
          html: '<body><p>Start: March 20, 2025</p></body>',
        });
      });
    });

    describe('time', () => {
      it('should format a time', async () => {
        await sendMail({
          email: 'marlon@brando.com',
          body: 'Start: {{time start}}',
          start: '2025-03-21T00:00:00.000Z',
        });
        assertMailSent({
          email: 'marlon@brando.com',
          html: '<body><p>Start: 8:00pm</p></body>',
        });
      });
    });

    describe('rtime', () => {
      it('should format a relative time', async () => {
        const date = new Date();
        date.setHours(date.getHours() - 2);
        await sendMail({
          email: 'marlon@brando.com',
          body: 'Start: {{rtime start}}',
          start: date,
        });
        assertMailSent({
          email: 'marlon@brando.com',
          html: '<body><p>Start: 2 hours ago</p></body>',
        });
      });
    });
  });

  describe('other', () => {
    it('should send a mail to a user without email param', async () => {
      const user = await createUser();
      await sendMail({
        user,
        body: 'Hello!',
      });
      assertMailSent({
        email: user.email,
        body: 'Hello!',
      });
    });

    it('should prioritize email param over user', async () => {
      const user = await createUser();
      await sendMail({
        user,
        email: 'foo@bar.com',
        body: 'Hello!',
      });
      assertMailCount(1);
      assertMailSent({
        email: 'foo@bar.com',
        body: 'Hello!',
      });
    });

    it('should send a mail to multiple users', async () => {
      const user1 = await createUser();
      const user2 = await createUser();
      await sendMail({
        users: [user1, user2],
        body: 'Hello!',
      });
      assertMailSent({
        email: `${user1.email},${user2.email}`,
        body: 'Hello!',
      });
    });

    it('should allow defaults', async () => {
      const user = await createUser();
      await sendMail({
        user,
        body: '{{user.foo "whee"}}',
      });

      assertMailSent({
        email: user.email,
        body: 'whee',
      });
    });

    it('should not fail on unknown property', async () => {
      const user = await createUser();
      await sendMail({
        user,
        body: '{{user.foo}}',
      });

      assertMailSent({
        email: user.email,
        body: '',
      });
    });

    it('should be empty for unknown global', async () => {
      const user = await createUser();
      await sendMail({
        user,
        body: '{{foo}}',
      });

      assertMailSent({
        email: user.email,
        body: '',
      });
    });

    it('should escape brackets', async () => {
      await sendMail({
        email: 'marlon@brando.com',
        body: '2 > 1',
      });
      assertMailSent({
        email: 'marlon@brando.com',
        body: '2 > 1',
        html: '<body><p>2 &gt; 1</p></body>',
      });
    });

    it('should have access to env', async () => {
      const user = await createUser();
      await sendMail({
        user,
        body: '{{APP_NAME}}',
      });

      assertMailSent({
        email: user.email,
        body: APP_NAME,
      });
    });

    it('should have access to current year', async () => {
      const user = await createUser();
      await sendMail({
        user,
        body: '{{currentYear}}',
      });

      assertMailSent({
        email: user.email,
        body: new Date().getFullYear().toString(),
      });
    });

    it('should not escape apostrophes or quotes', async () => {
      const user = await createUser();
      await sendMail({
        user,
        body: '& < > " \' ` =',
      });

      assertMailSent({
        email: user.email,
        html: '<body><p>&amp; &lt; &gt; " \' ` =</p></body>',
      });
    });

    it('should autolink URLs', async () => {
      const user = await createUser();
      await sendMail({
        user,
        body: '{{url}}',
        url: 'https://escape.com/foo?bar=baz',
      });

      assertMailSent({
        email: user.email,
        html: '<body><p><a href="https://escape.com/foo?bar=baz">https://escape.com/foo?bar=baz</a></p></body>',
      });
    });

    it('should perform basic escaping', async () => {
      const user = await createUser();
      const name = '<script>alert("hi")</script>';
      await sendMail({
        user,
        body: '{{name}}',
        name,
      });
      assertMailSent({
        email: user.email,
        html: '<body><p>&lt;script&gt;alert("hi")&lt;/script&gt;</p></body>',
      });
    });
  });
});

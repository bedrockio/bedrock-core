const { sendTemplatedMail } = require('../mailer');
const { assertMailSent } = require('postmark');
const { dedent } = require('../string');

describe('sendTemplatedMail', () => {
  it('should send out a welcome from file', async () => {
    await sendTemplatedMail({
      file: 'welcome.md',
      user: {
        email: 'marlon@brando.com',
        fullName: 'Marlon Brando',
      },
    });
    assertMailSent({ to: 'marlon@brando.com' });
  });

  it('should be able to use custom template', async () => {
    await sendTemplatedMail({
      template: 'Welcome!',
      subject: 'Hello from app',
      user: {
        email: 'marlon@brando.com',
        fullName: 'Marlon Brando',
      },
    });
    assertMailSent({ to: 'marlon@brando.com', body: 'Welcome!', subject: 'Hello from app' });
  });

  it('should be able to pull the subject from a markdown frontmatter', async () => {
    await sendTemplatedMail({
      template: dedent`
        ---
        subject: "Hello from app"
        ---
        Welcome!
      `,
      user: {
        email: 'marlon@brando.com',
        fullName: 'Marlon Brando',
      },
    });
    assertMailSent({ to: 'marlon@brando.com', body: 'Welcome!', subject: 'Hello from app' });
  });

  it('should allow variable injection inside subject', async () => {
    await sendTemplatedMail({
      template: dedent`
        ---
        subject: "It's {{weather}} today."
        ---
        Welcome!
      `,
      weather: 'sunny',
      user: {
        email: 'marlon@brando.com',
        fullName: 'Marlon Brando',
      },
    });
    assertMailSent({ to: 'marlon@brando.com', subject: "It's sunny today." });
  });

  it('should convert html body to plain text', async () => {
    await sendTemplatedMail({
      template: dedent`
        ---
        subject: "Hello"
        ---
        I'm a [link](http://example.com) inside the body.
      `,
      user: {
        email: 'marlon@brando.com',
        fullName: 'Marlon Brando',
      },
    });
    assertMailSent({ to: 'marlon@brando.com', text: "I'm a link (http://example.com) inside the body." });
  });
});

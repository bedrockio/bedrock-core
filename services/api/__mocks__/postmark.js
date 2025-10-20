let sentMessages;

beforeEach(() => {
  sentMessages = [];
});

function assertMailSent(options) {
  const { body, html, text, ...rest } = options;
  expect(sentMessages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        ...rest,
        ...(body && {
          body: expect.stringContaining(body),
        }),
        ...(html && {
          html: expect.stringContaining(html),
        }),
        ...(text && {
          text: expect.stringContaining(text),
        }),
      }),
    ]),
  );
}

function assertMailCount(count) {
  expect(sentMessages.length).toBe(count);
}

class ServerClient {
  sendEmail(email) {
    sentMessages.push({
      email: normalizeAddress(email.To),
      from: normalizeAddress(email.From),
      subject: email.Subject,
      text: email.TextBody.trim(),
      html: email.HtmlBody.trim(),
      body: email.body,
      template: email.template,
      cc: email.Cc,
      bcc: email.Bcc,
    });
  }
}

const REG = /.+ <(.+)>/;

function normalizeAddress(str) {
  return str
    .split(',')
    .map((address) => {
      const match = address.match(REG);
      return match ? match[1] : address;
    })
    .join(',');
}

function getLastSent() {
  return sentMessages[sentMessages.length - 1];
}

module.exports = {
  ServerClient,
  assertMailSent,
  assertMailCount,
  getLastSent,
};

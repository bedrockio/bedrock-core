let sentMessages;

beforeEach(() => {
  sentMessages = [];
});

function assertMailSent(options) {
  const { body, html, ...rest } = options;
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

module.exports = {
  ServerClient,
  assertMailSent,
  assertMailCount,
};

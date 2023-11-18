let sentMessages;

beforeEach(() => {
  sentMessages = [];
});

function assertMailSent(options) {
  expect(sentMessages).toEqual(expect.arrayContaining([expect.objectContaining(options)]));
}

function assertMailCount(count) {
  expect(sentMessages.length).toBe(count);
}

class ServerClient {
  sendEmail(email) {
    sentMessages.push({
      to: normalizeAddress(email.To),
      from: normalizeAddress(email.From),
      subject: email.Subject,
      body: email.body.trim(),
      text: email.TextBody.trim(),
      html: email.HtmlBody.trim(),
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

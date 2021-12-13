let sent = [];

function sendTemplatedMail({ template, content, to, user }) {
  const recipient = to || user.email;
  sent.push({ template, content, recipient });
}

function assertMailSent(template, recipient) {
  const mail = sent.find((mail) => {
    return mail.template === template;
  });

  try {
    expect(mail).not.toBeUndefined();
  } catch (error) {
    throw new Error(`Email "${template}" was not sent.`);
  }
  if (recipient) {
    expect(mail.recipient).toBe(recipient);
  }
}

afterEach(() => {
  sent = [];
});

module.exports = {
  sendTemplatedMail,
  assertMailSent,
};

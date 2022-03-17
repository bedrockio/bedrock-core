let sent = [];

function sendTemplatedMail({ template, content }) {
  sent.push({ template, content });
}

function assertMailSent(props) {
  const mail = sent.find((mail) => {
    for (let [key, val] of Object.entries(props)) {
      let match;
      if (key === 'to') {
        match = mail['To'].includes(val);
      } else if (key === 'subject') {
        match = mail['Subject'] === val;
      } else if (key === 'body') {
        match = mail['HtmlBody'].includes(val);
      } else if (key === 'text') {
        match = mail['TextBody'].trim() === val;
      } else {
        match = mail[key] === val;
      }
      if (!match) {
        return false;
      }
    }
    return true;
  });
  expect(mail).not.toBeUndefined();
}

afterEach(() => {
  sent = [];
});

module.exports = {
  sendTemplatedMail,
  assertMailSent,
};

class ServerClient {
  sendEmail(email) {
    sent.push(email);
  }
}

module.exports = {
  ServerClient,
  assertMailSent,
};

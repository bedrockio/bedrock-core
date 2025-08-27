let sentMessages;

beforeEach(() => {
  sentMessages = [];
});

function assertPushSent(options) {
  const { user, body, title, image, data } = options;
  expect(sentMessages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        token: user.deviceToken,
        notification: expect.objectContaining({
          ...(body && {
            body: expect.stringContaining(body),
          }),
          ...(title && {
            title: expect.stringContaining(title),
          }),
          ...(image && {
            image: expect.stringContaining(image),
          }),
        }),
        ...(data && {
          data,
        }),
      }),
    ]),
  );
}

function assertPushCount(count) {
  expect(sentMessages.length).toBe(count);
}

class MockMessaging {
  send(message) {
    sentMessages.push(message);
  }

  sendEachForMulticast(options) {
    const { tokens, ...rest } = options;
    for (let token of tokens) {
      sentMessages.push({
        ...rest,
        token,
      });
    }

    return {
      responses: tokens.map(() => {
        return { success: true };
      }),
    };
  }
}

function getLastMessage() {
  return sentMessages[sentMessages.length - 1];
}

module.exports = {
  initializeApp() {
    return {
      messaging() {
        return new MockMessaging();
      },
    };
  },
  credential: {
    applicationDefault() {
      return 'app';
    },
  },
  assertPushSent,
  assertPushCount,
  getLastMessage,
};

let sentMessages;

beforeEach(() => {
  sentMessages = [];
});

function assertPushSent(options) {
  const { body, ...rest } = options;
  expect(sentMessages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        ...rest,
        ...(body && {
          body: expect.stringContaining(body),
        }),
      }),
    ])
  );
}

function assertPushCount(count) {
  expect(sentMessages.length).toBe(count);
}

class MockMessaging {
  send(message) {
    const { notification } = message;
    sentMessages.push({
      ...message,
      ...notification,
    });
  }
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
};

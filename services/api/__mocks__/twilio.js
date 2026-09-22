const { default: twilio } = await vi.importActual('twilio');

let sentMessages;
let unsubscribed;

beforeEach(() => {
  sentMessages = [];
  unsubscribed = [];
});

async function sendMessage(options) {
  const { to } = options;
  if (!to) {
    throw new Error('No phone number.');
  } else if (unsubscribed.includes(to)) {
    const error = new Error('Attempt to send to unsubscribed recipient');
    error.code = 21610;
    throw error;
  }
  sentMessages.push({
    ...options,
    phone: options.to,
  });
}

function assertSmsSent(options) {
  const { body, ...rest } = options;
  expect(sentMessages).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        ...rest,
        ...(body && {
          body: expect.stringContaining(body),
        }),
      }),
    ]),
  );
}

function assertSmsCount(count) {
  expect(sentMessages.length).toBe(count);
}

function createClient() {
  return {
    messages: {
      create: sendMessage,
    },
  };
}

function setTwilioUnsubscribed(phone) {
  unsubscribed.push(phone);
}

Object.assign(createClient, twilio);

export { assertSmsSent, assertSmsCount, setTwilioUnsubscribed };

export default createClient;

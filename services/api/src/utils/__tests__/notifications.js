const { assertMailCount } = require('postmark');
const { assertSmsCount } = require('twilio');
const { assertPushCount } = require('firebase-admin');
const { createUser } = require('../../utils/testing');
const { sendNotification } = require('../notifications');

describe('sendNotification', () => {
  it('should send no notifications if nothing set', async () => {
    const user = await createUser();

    await sendNotification({
      name: 'product-updated',
      user,
    });
    assertMailCount(0);
    assertPushCount(0);
    assertSmsCount(0);
  });

  it('should send email if set', async () => {
    const user = await createUser({
      notifications: [
        {
          name: 'product-updated',
          email: 1,
        },
      ],
    });

    await sendNotification({
      name: 'product-updated',
      user,
    });
    assertMailCount(1);
    assertPushCount(0);
    assertSmsCount(0);
  });

  it('should send sms if set', async () => {
    const user = await createUser({
      phone: '+15551234567',
      notifications: [
        {
          name: 'product-updated',
          sms: 1,
        },
      ],
    });

    await sendNotification({
      name: 'product-updated',
      user,
    });
    assertMailCount(0);
    assertPushCount(0);
    assertSmsCount(1);
  });

  it('should send all', async () => {
    const user = await createUser({
      email: 'foo@bar.com',
      phone: '+15551234567',
      deviceToken: 'fake-token',
      notifications: [
        {
          name: 'product-updated',
          sms: 1,
          push: 1,
          email: 1,
        },
      ],
    });

    await sendNotification({
      name: 'product-updated',
      user,
    });
    assertMailCount(1);
    assertPushCount(1);
    assertSmsCount(1);
  });
});

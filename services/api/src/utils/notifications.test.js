const { assertMailCount } = require('postmark');
const { assertSmsCount } = require('twilio');
const { assertPushCount } = require('firebase-admin');
const { createUser } = require('./testing');
const { sendNotification } = require('./notifications');
const { mockTime, unmockTime } = require('./testing/time');
const { User } = require('../models');

jest.mock('../lib/notifications/types', () => {
  return [
    {
      name: 'product-updated',
      label: 'Product Updated',
      email: true,
    },
  ];
});

describe('sendNotification', () => {
  it('should send no notifications if nothing set', async () => {
    const user = await createUser();

    await sendNotification({
      type: 'product-updated',
      user,
    });
    assertMailCount(1);
    assertPushCount(0);
    assertSmsCount(0);
  });

  it('should send email if set', async () => {
    const user = await createUser({
      notifications: [
        {
          name: 'product-updated',
          email: true,
        },
      ],
    });

    await sendNotification({
      type: 'product-updated',
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
          sms: true,
        },
      ],
    });

    await sendNotification({
      type: 'product-updated',
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
          sms: true,
          push: true,
          email: true,
        },
      ],
    });

    await sendNotification({
      type: 'product-updated',
      user,
    });
    assertMailCount(1);
    assertPushCount(1);
    assertSmsCount(1);
  });

  it('should update count and last sent', async () => {
    mockTime('2025-03-01T00:00:00.000Z');

    let user = await createUser({
      email: 'foo@bar.com',
      phone: '+15551234567',
      deviceToken: 'fake-token',
      notifications: [
        {
          name: 'product-updated',
          sms: true,
          push: true,
          email: false,
        },
      ],
    });

    await sendNotification({
      type: 'product-updated',
      user,
    });

    user = await User.findById(user.id);
    expect(user.notifications).toMatchObject([
      {
        name: 'product-updated',
        sms: true,
        push: true,
        email: false,
        sent: 1,
        lastSentAt: new Date(),
      },
    ]);

    unmockTime();
  });

  it('should upsert count and last sent if they do not exist', async () => {
    mockTime('2025-03-01T00:00:00.000Z');

    let user = await createUser({
      email: 'foo@bar.com',
      phone: '+15551234567',
      deviceToken: 'fake-token',
    });

    await sendNotification({
      type: 'product-updated',
      user,
    });

    user = await User.findById(user.id);
    expect(user.notifications).toMatchObject([
      {
        name: 'product-updated',
        sms: false,
        push: false,
        email: true,
        sent: 1,
        lastSentAt: new Date(),
      },
    ]);

    unmockTime();
  });
});

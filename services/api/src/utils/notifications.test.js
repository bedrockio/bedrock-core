const config = require('@bedrockio/config');
const { assertMailSent, assertMailCount } = require('postmark');
const { assertSmsCount, setTwilioUnsubscribed } = require('twilio');
const { assertPushCount } = require('firebase-admin');
const { createUser } = require('./testing');
const { scheduleNotification, cancelNotification, sendNotifications, unsubscribe } = require('./notifications');
const { mockTime, advanceTime } = require('./testing/time');
const { User, Notification, Template } = require('../models');

const APP_URL = config.get('APP_URL');

async function createTemplate(attrs = {}) {
  return await Template.create({
    name: 'welcome-reminder',
    channels: ['email'],
    email: 'Hello',
    ...attrs,
  });
}

describe('scheduleNotification', () => {

  it('should create a pending notification with runAt defaulting to now', async () => {
    mockTime('2026-04-16T00:00:00.000Z');

    const user = await createUser();
    const template = await createTemplate();

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
    });

    const notification = await Notification.findOne();
    expect(notification.user.toString()).toBe(user.id);
    expect(notification.template.toString()).toBe(template.id);
    expect(notification.status).toBe('pending');
    expect(notification.runAt.toISOString()).toBe('2026-04-16T00:00:00.000Z');
  });

  it('should apply an offset to runAt', async () => {
    mockTime('2026-04-16T00:00:00.000Z');

    const user = await createUser();
    await createTemplate();

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
      offset: { hours: 48 },
    });

    const notification = await Notification.findOne();
    expect(notification.runAt.toISOString()).toBe('2026-04-18T00:00:00.000Z');
  });

  it('should accept a template document', async () => {
    const user = await createUser();
    const template = await createTemplate();

    await scheduleNotification({
      user,
      template,
    });

    const notification = await Notification.findOne();
    expect(notification.template.toString()).toBe(template.id);
  });

  it('should throw if the template cannot be found', async () => {
    const user = await createUser();

    await expect(
      scheduleNotification({
        user,
        template: 'missing-template',
      }),
    ).rejects.toThrow('Could not find template missing-template.');
  });
});

describe('cancelNotification', () => {
  it('should cancel a scheduled notification', async () => {
    const user = await createUser();
    await createTemplate();

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
    });

    await cancelNotification({
      user,
      template: 'welcome-reminder',
    });

    const notification = await Notification.findOne();
    expect(notification.status).toBe('canceled');
  });

  it('should only cancel notifications belonging to the given user', async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    await createTemplate();

    await scheduleNotification({
      user: user1,
      template: 'welcome-reminder',
    });
    await scheduleNotification({
      user: user2,
      template: 'welcome-reminder',
    });

    await cancelNotification({
      user: user1,
      template: 'welcome-reminder',
    });

    const notifications = await Notification.find().sort({ createdAt: 1 });
    expect(notifications[0].status).toBe('canceled');
    expect(notifications[1].status).toBe('pending');
  });

  it('should be a no-op if no matching notification exists', async () => {
    const user = await createUser();
    await createTemplate();

    await cancelNotification({
      user,
      template: 'welcome-reminder',
    });

    expect(await Notification.countDocuments()).toBe(0);
  });

  it('should throw if user is not provided', async () => {
    await createTemplate();
    await expect(
      cancelNotification({
        template: 'welcome-reminder',
      }),
    ).rejects.toThrow('User required.');
  });

  it('should throw if the template cannot be found', async () => {
    const user = await createUser();
    await expect(
      cancelNotification({
        user,
        template: 'missing-template',
      }),
    ).rejects.toThrow('Template required.');
  });
});

describe('sendNotifications', () => {

  it('should send pending notifications whose runAt is in the past', async () => {
    mockTime('2026-04-16T00:00:00.000Z');

    const user = await createUser({
      email: 'foo@bar.com',
    });
    await createTemplate();

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
      offset: { hours: 48 },
    });

    advanceTime(48 * 60 * 60 * 1000);

    await sendNotifications();

    assertMailSent({
      email: 'foo@bar.com',
      template: 'welcome-reminder',
    });

    const notification = await Notification.findOne();
    expect(notification.status).toBe('completed');
  });

  it('should not send notifications scheduled in the future', async () => {
    mockTime('2026-04-16T00:00:00.000Z');

    const user = await createUser();
    await createTemplate();

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
      offset: { hours: 48 },
    });

    await sendNotifications();

    assertMailCount(0);

    const notification = await Notification.findOne();
    expect(notification.status).toBe('pending');
  });

  it('should not send canceled notifications', async () => {
    mockTime('2026-04-16T00:00:00.000Z');

    const user = await createUser();
    await createTemplate();

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
      offset: { hours: 48 },
    });
    await cancelNotification({
      user,
      template: 'welcome-reminder',
    });

    advanceTime(48 * 60 * 60 * 1000);
    await sendNotifications();

    assertMailCount(0);
  });

  it('should not re-send completed notifications', async () => {
    const user = await createUser({
      email: 'foo@bar.com',
    });
    await createTemplate();

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
    });

    await sendNotifications();
    assertMailCount(1);

    await sendNotifications();
    assertMailCount(1);
  });

  it('should send each channel listed on the template', async () => {
    const user = await createUser({
      email: 'foo@bar.com',
      phone: '+15551234567',
      deviceToken: 'fake-token',
    });
    await createTemplate({
      channels: ['email', 'sms', 'push'],
      sms: 'Hi',
      push: 'Hi',
    });

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
    });

    await sendNotifications();

    assertMailCount(1);
    assertSmsCount(1);
    assertPushCount(1);
  });

  it('should respect user notification preferences', async () => {
    const user = await createUser({
      email: 'foo@bar.com',
      phone: '+15551234567',
      deviceToken: 'fake-token',
      notifications: [
        {
          type: 'one-off',
          email: true,
          sms: false,
          push: false,
        },
      ],
    });
    await createTemplate({
      channels: ['email', 'sms', 'push'],
      sms: 'Hi',
      push: 'Hi',
    });

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
    });
    await sendNotifications();

    assertMailCount(1);
    assertSmsCount(0);
    assertPushCount(0);
  });

  it('should initialize a user notifications entry when none exists', async () => {
    mockTime('2026-04-16T00:00:00.000Z');

    const user = await createUser({
      email: 'foo@bar.com',
    });
    await createTemplate();

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
    });
    await sendNotifications();

    const updated = await User.findById(user.id);
    expect(updated.notifications.toObject()).toMatchObject([
      {
        type: 'one-off',
        lastSentAt: new Date('2026-04-16T00:00:00.000Z'),
      },
    ]);
  });

  it('should include an unsubscribe link on emails', async () => {
    const user = await createUser({
      email: 'foo@bar.com',
    });
    await createTemplate();

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
    });
    await sendNotifications();

    assertMailSent({
      email: 'foo@bar.com',
      html: `${APP_URL}/unsubscribe`,
    });
  });

  it('should not halt on unsubscribed channels and disable them on the user', async () => {
    const user = await createUser({
      phone: '+15551234567',
      deviceToken: 'fake-token',
      notifications: [
        {
          type: 'one-off',
          sms: true,
          push: true,
          email: true,
        },
      ],
    });
    await createTemplate({
      channels: ['email', 'sms', 'push'],
      sms: 'Hi',
      push: 'Hi',
    });

    setTwilioUnsubscribed('+15551234567');

    await scheduleNotification({
      user,
      template: 'welcome-reminder',
    });
    await sendNotifications();

    assertSmsCount(0);
    assertMailCount(1);
    assertPushCount(1);

    const updated = await User.findById(user.id);
    expect(updated.notifications.toObject()).toMatchObject([
      {
        type: 'one-off',
        sms: false,
        push: true,
        email: true,
      },
    ]);
  });
});

describe('unsubscribe', () => {
  it('should disable a specific channel', async () => {
    let user = await createUser({
      notifications: [
        {
          type: 'products',
          sms: true,
          push: true,
          email: true,
        },
      ],
    });

    await unsubscribe({
      user,
      type: 'products',
      channel: 'email',
    });

    user = await User.findById(user.id);
    expect(user.notifications.toObject()).toMatchObject([
      {
        type: 'products',
        sms: true,
        push: true,
        email: false,
      },
    ]);
  });

  it('should disable all channels when channel is "all"', async () => {
    let user = await createUser({
      notifications: [
        {
          type: 'products',
          sms: true,
          push: true,
          email: true,
        },
      ],
    });

    await unsubscribe({
      user,
      type: 'products',
      channel: 'all',
    });

    user = await User.findById(user.id);
    expect(user.notifications.toObject()).toMatchObject([
      {
        type: 'products',
        sms: false,
        push: false,
        email: false,
      },
    ]);
  });

  it('should only affect the matching notification type', async () => {
    let user = await createUser({
      notifications: [
        {
          type: 'products',
          sms: true,
          push: true,
          email: true,
        },
        {
          type: 'other',
          sms: true,
          push: true,
          email: true,
        },
      ],
    });

    await unsubscribe({
      user,
      type: 'products',
      channel: 'all',
    });

    user = await User.findById(user.id);
    expect(user.notifications.toObject()).toMatchObject([
      {
        type: 'products',
        sms: false,
        push: false,
        email: false,
      },
      {
        type: 'other',
        sms: true,
        push: true,
        email: true,
      },
    ]);
  });
});

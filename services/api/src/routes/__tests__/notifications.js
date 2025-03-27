const { request, createUser } = require('../../utils/testing');
const { createMailToken } = require('../../utils/auth/tokens');
const { User } = require('../../models');

describe('/1/notifications', () => {
  describe('POST /unsubscribe', () => {
    it('should be able to unsubscribe to all notifications', async () => {
      let user = await createUser({
        notifications: [
          {
            name: 'test',
            email: true,
            push: true,
            sms: true,
          },
        ],
      });

      const token = createMailToken(user);

      const response = await request(
        'POST',
        '/1/notifications/unsubscribe',
        {
          type: 'test',
          channel: 'all',
          token,
        },
        { user },
      );

      expect(response.status).toBe(204);

      user = await User.findById(user.id);

      expect(user.notifications.toObject()).toMatchObject([
        {
          name: 'test',
          email: false,
          push: false,
          sms: false,
        },
      ]);
    });

    it('should be able to unsubscribe to specific channels', async () => {
      let user = await createUser({
        notifications: [
          {
            name: 'test',
            email: true,
            push: true,
            sms: true,
          },
        ],
      });

      const token = createMailToken(user);

      const response = await request(
        'POST',
        '/1/notifications/unsubscribe',
        {
          type: 'test',
          channel: 'sms',
          token,
        },
        { user },
      );

      expect(response.status).toBe(204);

      user = await User.findById(user.id);

      expect(user.notifications.toObject()).toMatchObject([
        {
          name: 'test',
          email: true,
          push: true,
          sms: false,
        },
      ]);
    });
  });
});

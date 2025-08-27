const { request, createUser } = require('../utils/testing');
const { createAccessToken } = require('../utils/tokens');
const { User } = require('../models');

describe('/1/unsubscribe', () => {
  describe('POST /', () => {
    it('should unsubcribe from notifications', async () => {
      let user = await createUser({
        name: 'test 1',
        description: 'Some description',
        notifications: [
          {
            name: 'product-updated',
            sms: false,
            push: false,
            email: true,
          },
        ],
      });

      const token = createAccessToken(user, {
        name: 'product-updated',
        action: 'unsubscribe',
        channel: 'email',
      });

      const response = await request('POST', '/1/unsubscribe', {}, { token });

      expect(response).toHaveStatus(204);

      user = await User.findById(user.id);

      expect(user.notifications.toObject()).toMatchObject([
        {
          name: 'product-updated',
          sms: false,
          push: false,
          email: false,
        },
      ]);
    });
  });
});

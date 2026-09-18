import { request, createUser } from '../utils/testing/index.js';
import { createAccessToken } from '../utils/tokens.js';
import { User } from '../models/index.js';

describe('/1/unsubscribe', () => {
  describe('POST /', () => {
    it('should unsubcribe from notifications', async () => {
      let user = await createUser({
        name: 'test 1',
        description: 'Some description',
        notifications: [
          {
            type: 'product-updated',
            sms: false,
            push: false,
            email: true,
          },
        ],
      });

      const token = createAccessToken(user, {
        type: 'product-updated',
        action: 'unsubscribe',
        channel: 'email',
      });

      const response = await request('POST', '/1/unsubscribe', {}, { token });

      expect(response).toHaveStatus(204);

      user = await User.findById(user.id);

      expect(user.notifications.toObject()).toMatchObject([
        {
          type: 'product-updated',
          sms: false,
          push: false,
          email: false,
        },
      ]);
    });
  });
});

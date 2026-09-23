vi.hoisted(() => {
  process.env.AUTH_PASSKEY = 'false';
});

import { request } from '../../utils/testing/index.js';

describe('/1/auth/passkey (disabled)', () => {
  it('should reject passkey routes', async () => {
    const response = await request('POST', '/1/auth/passkey/generate-login', {});
    expect(response).toHaveStatus(403);
  });

  it('should report passkey as disabled in meta', async () => {
    const response = await request('GET', '/1/meta', {}, {});
    expect(response.body.data.auth.passkey).toBe(false);
  });
});

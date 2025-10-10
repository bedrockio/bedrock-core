const { request } = require('./utils/testing');

describe('Test App Index', () => {
  test('It should have a valid index response', async () => {
    const response = await request('GET', '/');
    expect(response).toHaveStatus(200);
    expect(typeof response.body.version).toBe('string');
  });
});

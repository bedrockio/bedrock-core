import { request } from '../test-helpers';

describe('Test App Index', () => {
  test('It should have a valid index response', async () => {
    const response = await request('GET', '/');
    expect(response.statusCode).toBe(200);
    expect(typeof response.body.version).toBe('string');
  });
});

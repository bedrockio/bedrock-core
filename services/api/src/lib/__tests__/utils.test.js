const { routerToOpenApi } = require('../openapi');

describe('Utils', () => {
  test('It should extract OpenAPI paths from a Koa Router', async () => {
    const router = require('../../v1/users');
    const result = routerToOpenApi(router);
    const { paths } = result;
    expect(paths.length > 4).toBe(true);
    const patchDefinition = paths.find((d) => d.method === 'PATCH' && d.path === '/:userId');
    expect(patchDefinition.method).toBe('PATCH');
    expect(patchDefinition.path).toBe('/:userId');
    expect(patchDefinition.requestBody.length > 4).toBe(true);
  });
});

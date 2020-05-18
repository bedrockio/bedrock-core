const { routerToOpenApi } = require('../utils');

describe('Utils', () => {
  test('It should extract OpenAPI paths from a Koa Router', async () => {
    const router = require('../../v1/users')
    const result = routerToOpenApi(router)
    const {paths} = result
    expect(paths.length > 4).toBe(true)
    const patchDefinition = paths.find(d => d.method === 'PATCH' && d.path === '/:user')
    expect(patchDefinition.method).toBe('PATCH')
    expect(patchDefinition.path).toBe('/:user')
    expect(patchDefinition.requestBody.length > 4).toBe(true)
  });
});

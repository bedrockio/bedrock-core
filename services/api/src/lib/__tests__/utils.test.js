const { routerToOpenApi } = require('../utils');

describe('Utils', () => {
  test('It should extract OpenAPI calls from a Koa Router', async () => {
    const router = require('../../v1/users')
    const result = routerToOpenApi(router)
    expect(result.length > 4).toBe(true)
    const patchDefinition = result.find(d => d.operationId === 'PATCH /:user')
    expect(patchDefinition.method).toBe('PATCH')
    expect(patchDefinition.path).toBe('/:user')
    expect(patchDefinition.requestBody.length > 4).toBe(true)
  });
});

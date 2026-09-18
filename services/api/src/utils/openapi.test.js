const fs = require('fs/promises');
const SwaggerParser = require('@apidevtools/swagger-parser');
const { generateDefinition } = require('./openapi');

// Routes load mocks that register hooks, so they must be required outside the test.
require('../routes');

describe('generateDefinition', () => {
  it('should generate a valid OpenAPI definition', async () => {
    const writeFile = jest.spyOn(fs, 'writeFile').mockResolvedValue();
    const definition = await generateDefinition();
    writeFile.mockRestore();
    await expect(SwaggerParser.validate(definition)).resolves.toBeDefined();
  });
});

const fs = require('fs/promises');
const { generateDefinition, DEFINITION_FILE } = require('./openapi');

// Routes load mocks that register hooks, so they must be required outside the test.
require('../routes');

describe('generateDefinition', () => {
  it('should match the committed definition (run "pnpm docs:generate" if this fails)', async () => {
    const committed = JSON.parse(await fs.readFile(DEFINITION_FILE, 'utf-8'));
    const writeFile = jest.spyOn(fs, 'writeFile').mockResolvedValue();
    const definition = await generateDefinition();
    writeFile.mockRestore();
    expect(JSON.parse(JSON.stringify(definition))).toEqual(committed);
  });
});

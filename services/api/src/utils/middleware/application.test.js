const { applicationMiddleware } = require('./application');
const { importFixtures } = require('../fixtures');
const { context } = require('../testing');

describe('application', () => {
  it('should set an request id', async () => {
    const application = await importFixtures('applications/web');
    const middleware = applicationMiddleware({ ignorePaths: [] });

    const ctx = context({
      headers: {
        'api-key': application.apiKey,
      },
    });

    await middleware(ctx, () => {});

    const [applicationId, hash] = ctx.response.header['request-id'].split('-');
    expect(applicationId).toBe(application.apiKey);
    expect(hash).toBeDefined();
    expect(hash).toHaveLength(16);
  });

  it('should not fail if no key is set', async () => {
    const middleware = applicationMiddleware({ ignorePaths: [] });
    const ctx = context();
    await expect(middleware(ctx, () => {})).resolves.not.toThrow();
  });
});

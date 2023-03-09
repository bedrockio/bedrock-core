const { applicationMiddleware } = require('../application');
const { importFixtures } = require('../../../utils/fixtures');
const { context } = require('../../testing');

const { ApplicationRequest } = require('./../../../models');

describe('application', () => {
  it('should set an request id', async () => {
    const application = await importFixtures('applications/web');
    const middleware = applicationMiddleware({ ignorePaths: [] });

    const ctx = context({
      headers: {
        apikey: application.apiKey,
      },
    });

    await middleware(ctx, () => {});

    const [applicationId, hash] = ctx.response.header['request-id'].split('-');
    expect(applicationId).toBe(application.apiKey);
    expect(hash).toBeDefined();
    expect(hash).toHaveLength(16);
  });

  it('should truncate large response data.length < 20', async () => {
    const application = await importFixtures('applications/web');
    const middleware = applicationMiddleware({ ignorePaths: [] });
    const ctx = context({
      headers: {
        apikey: application.apiKey,
      },
    });

    ctx.request.body = {
      password: 'password',
    };

    ctx.body = {
      data: [...new Array(23)].map((c, index) => index),
    };

    await middleware(ctx, () => {});

    const applicationRequest = await ApplicationRequest.findOne({
      requestId: ctx.response.header['request-id'],
    });
    expect(applicationRequest.response.body.data[20]).toBe('[3 items has been truncated]');
  });

  it('should redact fields [token|password|secret|hash...]', async () => {
    const application = await importFixtures('applications/web');
    const middleware = applicationMiddleware({ ignorePaths: [] });
    const ctx = context({
      headers: {
        apikey: application.apiKey,
      },
    });

    ctx.request.body = {
      password: 'password',
    };

    ctx.body = {
      attribute: '123',
      password: 'token',
      jwt: 'token',
      deeplyNested: {
        stoken: 123123,
      },
      nestedArray: [
        {
          hash: 'something',
        },
      ],
      test: [
        {
          sneakyKey: 'big secret',
          tested: ['234', 'test', null],
          attribute: '123',
        },
      ],
      secrets: ['string', 'string'],
    };

    await middleware(ctx, () => {});

    const applicationRequest = await ApplicationRequest.findOne({
      requestId: ctx.response.header['request-id'],
    });

    expect(applicationRequest.response.body).toMatchObject({
      password: '[redacted]',
      jwt: '[redacted]',
      deeplyNested: { stoken: '[redacted]' },
      attribute: '123',
      nestedArray: [{ hash: '[redacted]' }],
      secrets: ['[redacted]', '[redacted]'],
      test: [
        {
          sneakyKey: '[redacted]',
          tested: ['234', 'test', null],
          attribute: '123',
        },
      ],
    });
  });
});

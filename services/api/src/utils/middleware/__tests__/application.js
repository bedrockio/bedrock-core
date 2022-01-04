const { applicationMiddleware } = require('../application');
const { setupDb, teardownDb, context } = require('../../testing');
const { Application, ApplicationEntry } = require('./../../../models');
const mongoose = require('mongoose');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('application', () => {
  it('should set an request id', async () => {
    const application = await Application.create({
      name: Date.now(),
      clientId: Date.now(),
      user: mongoose.Types.ObjectId(),
    });

    const middleware = applicationMiddleware({ ignorePaths: [] });
    const ctx = context({
      headers: {
        ['client-id']: application.clientId,
      },
    });

    await middleware(ctx, () => {});
    const [applicationId, hash] = ctx.response.header['request-id'].split('-');
    expect(applicationId).toBe(application.clientId);
    expect(hash).toBeDefined();
    expect(hash).toHaveLength(16);
  });

  it('should redact fields [password/token/code]', async () => {
    const application = await Application.create({
      name: Date.now(),
      clientId: Date.now(),
      user: mongoose.Types.ObjectId(),
    });

    const middleware = applicationMiddleware({ ignorePaths: [] });
    const ctx = context({
      headers: {
        ['client-id']: application.clientId,
      },
    });

    ctx.request.body = {
      password: 'password',
    };

    ctx.body = {
      justakey: '123',
      password: 'token',
      deeplyNested: {
        token: 123123,
      },
      nestedArray: [
        {
          hash: 'something',
        },
      ],
      secrets: ['string', 'string'],
    };

    await middleware(ctx, () => {});
    const applicationEntry = await ApplicationEntry.findOne({
      requestId: ctx.response.header['request-id'],
    });

    expect(applicationEntry.response.body).toMatchObject({
      justakey: '123',
      password: '[redacted]',
      deeplyNested: { token: '[redacted]' },
      nestedArray: [{ hash: '[redacted]' }],
      secrets: ['[redacted]', '[redacted]'],
    });
  });
});

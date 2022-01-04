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
    const ctx = context(
      {
        headers: {
          ['client-id']: application.clientId,
        },
        body: {
          password: 'password',
        },
      },
      {
        body: {
          data: {
            password: 'token',
            deeplyNested: {
              token: 'token',
            },
          },
        },
      }
    );

    await middleware(ctx, () => {});
    const applicationEntry = await ApplicationEntry.findOne({
      requestId: ctx.response.header['request-id'],
    });
    console.log('entry', applicationEntry);
  });
});

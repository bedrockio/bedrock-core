const { applicationMiddleware } = require('../application');
const { sleep } = require('../../../utils/sleep');
const { setupDb, teardownDb, context } = require('../../testing');
const EventEmitter = require('events');

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

    const ctx = context(
      {
        headers: {
          ['client-id']: application.clientId,
        },
      },
      EventEmitter.prototype
    );

    await middleware(ctx, () => {});

    const [applicationId, hash] = ctx.response.header['request-id'].split('-');
    expect(applicationId).toBe(application.clientId);
    expect(hash).toBeDefined();
    expect(hash).toHaveLength(16);
  });

  it('should truncate large response data.length < 20', async () => {
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
      },
      EventEmitter.prototype
    );

    ctx.request.body = {
      password: 'password',
    };

    ctx.body = {
      data: [...new Array(23)].map((c, index) => index),
    };

    await middleware(ctx, () => {});
    ctx.res.emit('finish');
    await sleep(50);
    const applicationEntry = await ApplicationEntry.findOne({
      requestId: ctx.response.header['request-id'],
    });
    expect(applicationEntry.response.body.data[20]).toBe('[3 items has been truncated]');
  });

  it('should redact fields [token|password|secret|hash...]', async () => {
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
      },
      EventEmitter.prototype
    );

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
    ctx.res.emit('finish');
    await sleep(50);

    const applicationEntry = await ApplicationEntry.findOne({
      requestId: ctx.response.header['request-id'],
    });

    expect(applicationEntry.response.body).toMatchObject({
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

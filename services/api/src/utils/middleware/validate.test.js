const yd = require('@bedrockio/yada');
const { validateBody, validateQuery } = require('./validate');
const { context } = require('../testing');

describe('validateBody', () => {
  it('should not throw an error if empty object passed', async () => {
    const middleware = validateBody({});
    const ctx = context();
    await expect(middleware(ctx, () => {})).resolves.not.toThrow('"value" must have at least 1 key');
  });

  it('should reject a request with invalid params', async () => {
    // Require test param, but don't provide it in ctx object:
    const middleware = validateBody({
      test: yd.number().required(),
    });
    const ctx = context();
    ctx.request.body = {};
    await expect(middleware(ctx, () => {})).rejects.toThrow();
  });

  it('should accept a valid request', async () => {
    const middleware = validateBody({
      test: yd.string().required(),
    });
    const ctx = context({ url: '/' });
    ctx.request.body = { test: 'something' };

    await middleware(ctx, () => {
      expect(ctx.request.body.test).toBe('something');
    });
  });

  it('should support the light syntax', async () => {
    const middleware = validateBody({
      test: yd.string().required(),
    });
    const ctx = context({ url: '/' });
    ctx.request.body = { test: 'something' };

    await middleware(ctx, () => {
      expect(ctx.request.body.test).toBe('something');
    });
  });

  it('should strip unknown fields', async () => {
    const middleware = validateBody(
      yd
        .object({
          test: yd.string().required(),
        })
        .options({
          stripUnknown: true,
        }),
    );
    const ctx = context({ url: '/' });
    ctx.request.body = { test: 'something', foo: 'bar' };

    await middleware(ctx, () => {
      expect(ctx.request.body.test).toBe('something');
      expect(ctx.request.body.foo).toBeUndefined();
    });
  });

  it('should transform body', async () => {
    const middleware = validateBody({
      test: yd.custom(async (val) => {
        return val.toUpperCase();
      }),
    });
    const ctx = context({ url: '/' });
    ctx.request.body = { test: 'something' };

    await middleware(ctx, () => {
      expect(ctx.request.body.test).toBe('SOMETHING');
    });
  });
});

describe('validateQuery', () => {
  it('should do type conversion for query', async () => {
    const middleware = validateQuery({
      convertToNumber: yd.number().required(),
    });
    const ctx = context({ url: '/' });
    ctx.request.query = {
      convertToNumber: '1234',
    };

    await middleware(ctx, () => {
      expect(ctx.request.query.convertToNumber).toBe(1234);
    });
  });

  it('should error on undefined attributes', async () => {
    const middleware = validateQuery({
      somethingExisting: yd.string(),
    });

    const ctx = context({ url: '/' });
    ctx.request.query = {
      somethingExisting: 'yes',
      shouldBeRemoved: 'should be been removed from request',
    };

    await expect(middleware(ctx, () => {})).rejects.toThrow();
  });
});

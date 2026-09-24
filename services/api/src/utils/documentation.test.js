import yd from '@bedrockio/yada';
import documentation from './documentation.js';
import { User } from '../models/index.js';
import { context, createUser } from './testing/index.js';

function run(middleware, status, body) {
  const ctx = context();
  return middleware(ctx, () => {
    ctx.status = status;
    ctx.body = body;
  });
}

describe('include', () => {
  it('should expose its parts to the generator', () => {
    const parts = [documentation.description('Login'), documentation.success(200)];
    const middleware = documentation.include(...parts);
    expect(middleware.documentation).toEqual(parts);
  });

  it('should accept a body matching a variant', async () => {
    const middleware = documentation.include(
      documentation.success(200, { schema: { data: { token: yd.string() } } }),
      documentation.success(200, { schema: { data: { mfaRequired: yd.boolean() } } }),
    );
    await expect(run(middleware, 200, { data: { mfaRequired: true } })).resolves.not.toThrow();
  });

  it('should allow keys the schema does not list', async () => {
    const middleware = documentation.include(documentation.success(200, { schema: { data: { token: yd.string() } } }));
    await expect(run(middleware, 200, { data: { token: 'a', extra: 1 } })).resolves.not.toThrow();
  });

  it('should reject a body matching no variant', async () => {
    const middleware = documentation.include(documentation.success(200, { schema: { data: { token: yd.string() } } }));
    await expect(run(middleware, 200, { data: { token: 5 } })).rejects.toThrow('does not match its documentation');
  });

  it('should reject an undocumented status', async () => {
    const middleware = documentation.include(documentation.success(200));
    await expect(run(middleware, 201, {})).rejects.toThrow('which is not documented');
  });

  it('should accept any body for a variant without a schema', async () => {
    const middleware = documentation.include(documentation.success(200, { description: 'Opaque.' }));
    await expect(run(middleware, 200, { anything: true })).resolves.not.toThrow();
  });

  it('should validate serialized models against model refs', async () => {
    const user = await createUser();
    const middleware = documentation.include(documentation.success(200, { schema: { data: User } }));
    await expect(run(middleware, 200, { data: user })).resolves.not.toThrow();
    await expect(run(middleware, 200, { data: 'user' })).rejects.toThrow();
  });

  it('should validate arrays of models', async () => {
    const user = await createUser();
    const middleware = documentation.include(documentation.success(200, { schema: { data: [User] } }));
    await expect(run(middleware, 200, { data: [user] })).resolves.not.toThrow();
  });
});

describe('success', () => {
  it('should tag models for the generator', () => {
    const { schema } = documentation.success(200, { schema: { data: User } });
    expect(schema.toOpenApi().properties.data['x-ref']).toBe('User');
  });
});

const config = require('@bedrockio/config');
const { setupDb, teardownDb } = require('../../utils/testing');
const { importFixtures } = require('../fixtures');

const { ADMIN_EMAIL } = config.getAll();

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('import', () => {
  it('should load root fixtures', async () => {
    const fixtures = await importFixtures();
    expect(fixtures).toMatchObject({
      users: {
        admin: {
          email: ADMIN_EMAIL,
        },
      },
      'users/admin': {
        email: ADMIN_EMAIL,
      },
      shops: {
        demo: {
          name: 'Demo',
        },
      },
      'shops/demo': {
        name: 'Demo',
      },
    });
  });

  it('should load directory fixtures', async () => {
    const fixtures = await importFixtures('users');
    expect(fixtures).toMatchObject({
      admin: {
        email: ADMIN_EMAIL,
      },
    });
  });

  it('should load single fixture', async () => {
    const admin = await importFixtures('users/admin');
    expect(admin).toMatchObject({
      email: ADMIN_EMAIL,
      hashedPassword: expect.any(String),
    });
  });

  it('should not be serialized', async () => {
    const admin = await importFixtures('users/admin');
    expect(admin.save).toBeInstanceOf(Function);
  });
});

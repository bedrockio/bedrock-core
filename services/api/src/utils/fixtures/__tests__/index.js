const { importFixtures } = require('../');

jest.mock('../const');

// TODO: enable once we move package out
describe.skip('importFixtures', () => {
  it('should load root fixtures', async () => {
    const fixtures = await importFixtures();
    expect(fixtures).toMatchObject({
      users: {
        jack: {
          firstName: 'Joe',
        },
      },
      'users/admin': {
        name: 'Joe',
      },
    });
  });

  it('should load directory fixtures', async () => {
    const fixtures = await importFixtures('users');
    expect(fixtures).toMatchObject({
      admin: {
        name: 'Joe',
      },
    });
  });

  it('should load single fixture', async () => {
    const admin = await importFixtures('users/admin');
    expect(admin).toMatchObject({
      name: 'Joe',
    });
  });

  it('should not be serialized', async () => {
    const admin = await importFixtures('users/admin');
    expect(admin.save).toBeInstanceOf(Function);
  });

  it('should import content files', async () => {
    const post = await importFixtures('posts/post');
    expect(post).toMatchObject({
      content: '# Header\n',
      nested: {
        nestedContent: '# Header\n',
      },
    });
  });
});

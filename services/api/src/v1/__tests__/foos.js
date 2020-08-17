const Foo = require('../../models/foo');
const Upload = require('../../models/upload');
const { setupDb, teardownDb, request, createUser } = require('../../test-helpers');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});



describe('/1/foos', () => {
  describe('POST /search', () => {
    it('it should list out foos', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });

  describe('POST /', () => {
    it('should be able to create foo', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });

  describe('DELETE /:foo', () => {
    it('should be able to delete foo', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });

  describe('PATCH /:foo', () => {
    it('should be able to update foo', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });

  describe('GET /:foo', () => {
    it('should be able to access foo', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });
});

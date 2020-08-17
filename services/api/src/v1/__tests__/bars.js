const Bar = require('../../models/bar');
const Upload = require('../../models/upload');
const { setupDb, teardownDb, request, createUser } = require('../../test-helpers');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});



describe('/1/bars', () => {
  describe('POST /search', () => {
    it('it should list out bars', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });

  describe('POST /', () => {
    it('should be able to create bar', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });

  describe('DELETE /:bar', () => {
    it('should be able to delete bar', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });

  describe('PATCH /:bar', () => {
    it('should be able to update bar', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });

  describe('GET /:bar', () => {
    it('should be able to access bar', async () => {
      expect.assertions(1); // TODO: write me!
    });
  });
});

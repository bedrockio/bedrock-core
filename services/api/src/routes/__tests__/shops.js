const { setupDb, teardownDb, request, createUpload, createUser } = require('../../utils/testing');
const { Shop, Upload } = require('../../models');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/shops', () => {
  describe('POST /search', () => {
    it('should list out shops', async () => {
      const user = await createUser();

      const shop1 = await Shop.create({
        name: 'test 1',
        description: 'Some description',
      });

      const shop2 = await Shop.create({
        name: 'test 2',
        description: 'Some description',
      });

      const response = await request('POST', '/1/shops/search', {}, { user });

      expect(response.status).toBe(200);
      const body = response.body;
      expect(body.data[1].name).toBe(shop1.name);
      expect(body.data[0].name).toBe(shop2.name);
      expect(body.meta.total).toBe(2);
    });
  });

  describe('GET /:shop', () => {
    it('should be able to access shop', async () => {
      const user = await createUser();
      const shop = await Shop.create({
        name: 'new shop',
      });
      const response = await request('GET', `/1/shops/${shop.id}`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(shop.name);
    });
  });

  describe('POST /', () => {
    it('should be able to create shop', async () => {
      const user = await createUser();
      const upload = await createUpload();
      const response = await request(
        'POST',
        '/1/shops',
        {
          name: 'shop name',
          images: [upload.id],
        },
        { user }
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data.name).toBe('shop name');
      expect(data.images[0].id).toBe(upload.id);
      expect(data.images[0].hash).toBe('test');
    });
  });

  describe('DELETE /:shop', () => {
    it('should be able to delete shop', async () => {
      const user = await createUser();
      let shop = await Shop.create({
        name: 'test 1',
        description: 'Some description',
      });
      const response = await request('DELETE', `/1/shops/${shop.id}`, {}, { user });
      expect(response.status).toBe(204);
      shop = await Shop.findByIdDeleted(shop.id);
      expect(shop.deletedAt).toBeDefined();
    });
  });

  describe('PATCH /:shop', () => {
    it('should be able to update shop', async () => {
      const user = await createUser();
      let shop = await Shop.create({
        name: 'shop name',
        description: 'Some description',
      });
      shop.name = 'new name';
      const response = await request('PATCH', `/1/shops/${shop.id}`, shop.toJSON(), { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('new name');
      shop = await Shop.findById(shop.id);
      expect(shop.name).toEqual('new name');
    });
  });
});

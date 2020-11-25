const { setupDb, teardownDb, request, createUser } = require('../../test-helpers');
const { Shop, Upload } = require('../../models');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

const createUpload = () => {
  return Upload.create({
    filename: 'logo.png',
    rawUrl: 'logo.png',
    hash: 'test',
    storageType: 'local',
    mimeType: 'image/png',
    ownerId: 'none',
  });
};

describe('/1/shops', () => {
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

  describe('GET /:shop', () => {
    it('should be able to access shop', async () => {
      const user = await createUser();
      const shop = await Shop.create({
        name: 'test 1',
        description: 'Some description',
      });
      const response = await request('GET', `/1/shops/${shop.id}`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(shop.name);
    });
  });

  describe('POST /search', () => {
    it('it should list out shops', async () => {
      const user = await createUser();
      await Shop.deleteMany({});

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

  describe('PATCH /:shop', () => {
    it('should be able to update shop', async () => {
      const user = await createUser();
      const shop = await Shop.create({
        name: 'shop name',
        description: 'Some description',
      });
      shop.name = 'new name';
      const response = await request('PATCH', `/1/shops/${shop.id}`, shop.toJSON(), { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('new name');
      const dbShop = await Shop.findById(shop.id);
      expect(dbShop.name).toEqual('new name');
    });
  });

  describe('DELETE /:shop', () => {
    it('should be able to delete shop', async () => {
      const user = await createUser();
      const shop = await Shop.create({
        name: 'new shop',
      });
      const response = await request('DELETE', `/1/shops/${shop.id}`, {}, { user });
      expect(response.status).toBe(204);
      const dbShop = await Shop.findById(shop.id);
      expect(dbShop.deletedAt).toBeDefined();
    });
  });
});

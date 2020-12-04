const mongoose = require('mongoose');

const { setupDb, teardownDb, request, createUser } = require('../../test-helpers');
const { Product } = require('../../models');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/products', () => {
  describe('POST /', () => {
    it('should be able to create product', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/products',
        {
          name: 'some other product',
          shop: mongoose.Types.ObjectId(),
        },
        { user }
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data.name).toBe('some other product');
    });
  });

  describe('GET /:product', () => {
    it('should be able to access product', async () => {
      const user = await createUser();
      const product = await Product.create({
        name: 'test 1',
        description: 'Some description',
        shop: mongoose.Types.ObjectId(),
      });
      const response = await request('GET', `/1/products/${product.id}`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(product.name);
    });
  });

  describe('POST /search', () => {
    it('should list out products', async () => {
      const user = await createUser();
      await Product.deleteMany({});

      const product1 = await Product.create({
        name: 'test 1',
        description: 'Some description',
        shop: mongoose.Types.ObjectId(),
      });

      const product2 = await Product.create({
        name: 'test 2',
        description: 'Some description',
        shop: mongoose.Types.ObjectId(),
      });

      const response = await request('POST', '/1/products/search', {}, { user });

      expect(response.status).toBe(200);
      const body = response.body;
      expect(body.data[1].name).toBe(product1.name);
      expect(body.data[0].name).toBe(product2.name);

      expect(body.meta.total).toBe(2);
    });
  });

  describe('PATCH /:product', () => {
    it('admins should be able to update product', async () => {
      const user = await createUser();
      const product = await Product.create({
        name: 'test 1',
        description: 'Some description',
        shop: mongoose.Types.ObjectId(),
      });
      const response = await request('PATCH', `/1/products/${product.id}`, { name: 'new name' }, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('new name');
      const dbProduct = await Product.findById(product.id);
      expect(dbProduct.name).toEqual('new name');
    });
  });

  describe('DELETE /:product', () => {
    it('should be able to delete product', async () => {
      const user = await createUser();
      const product = await Product.create({
        name: 'test 1',
        description: 'Some description',
        shop: mongoose.Types.ObjectId(),
      });
      const response = await request('DELETE', `/1/products/${product.id}`, {}, { user });
      expect(response.status).toBe(204);
      const dbProduct = await Product.findById(product.id);
      expect(dbProduct.deletedAt).toBeDefined();
    });
  });
});

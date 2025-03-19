const { request, createUser, createAdmin, createUpload } = require('../../utils/testing');
const { Shop, AuditEntry } = require('../../models');

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
    it('should access shop', async () => {
      const user = await createUser();
      const shop = await Shop.create({
        name: 'new shop',
      });
      const response = await request('GET', `/1/shops/${shop.id}`, {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe(shop.name);
    });

    it('should populate images', async () => {
      const user = await createUser();
      const image = await createUpload();
      const shop = await Shop.create({
        name: 'new shop',
        images: [image],
      });
      const response = await request(
        'GET',
        `/1/shops/${shop.id}`,
        {
          include: 'images',
        },
        { user },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.images[0].id).toBe(image.id);
    });
  });

  describe('POST /', () => {
    it('should create shop', async () => {
      const user = await createUser();
      const response = await request(
        'POST',
        '/1/shops',
        {
          name: 'shop name',
        },
        { user },
      );
      const data = response.body.data;
      expect(response.status).toBe(200);
      expect(data.name).toBe('shop name');

      const auditEntry = await AuditEntry.findOne({
        objectId: data.id,
      });
      expect(auditEntry.activity).toBe('Created shop');
      expect(auditEntry.actor).toEqual(user._id);
      expect(auditEntry.ownerId).toBe(user.id);
      expect(auditEntry.ownerType).toBe('User');
    });
  });

  describe('PATCH /:shop', () => {
    it('should update shop as admin', async () => {
      const admin = await createAdmin();
      let shop = await Shop.create({
        name: 'shop name',
        description: 'Some description',
      });
      shop.name = 'new name';
      const response = await request('PATCH', `/1/shops/${shop.id}`, shop.toJSON(), { user: admin });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('new name');
      shop = await Shop.findById(shop.id);
      expect(shop.name).toEqual('new name');
    });

    it('should update shop as owner', async () => {
      const owner = await createAdmin();
      let shop = await Shop.create({
        name: 'shop name',
        description: 'Some description',
        owner,
      });
      shop.name = 'new name';
      const response = await request('PATCH', `/1/shops/${shop.id}`, shop.toJSON(), { user: owner });
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('new name');
      shop = await Shop.findById(shop.id);
      expect(shop.name).toEqual('new name');
    });

    it('should not allow anyone to update shop', async () => {
      const user = await createUser();
      let shop = await Shop.create({
        name: 'shop name',
        description: 'Some description',
      });
      shop.name = 'new name';
      const response = await request('PATCH', `/1/shops/${shop.id}`, shop.toJSON(), { user });
      expect(response.status).toBe(401);
    });

    it('should populate by request body', async () => {
      const admin = await createAdmin();
      const image = await createUpload();
      const shop = await Shop.create({
        name: 'shop',
        images: [image],
      });

      const response = await request(
        'PATCH',
        `/1/shops/${shop.id}`,
        {
          name: 'new shop',
          include: 'images',
        },
        { user: admin },
      );
      expect(response.status).toBe(200);
      expect(response.body.data.images[0].id).toBe(image.id);
    });
  });

  describe('DELETE /:shop', () => {
    it('should allow admin to delete shop', async () => {
      const admin = await createAdmin();
      const owner = await createUser();
      let shop = await Shop.create({
        name: 'test 1',
        description: 'Some description',
        owner: owner.id,
      });
      const response = await request('DELETE', `/1/shops/${shop.id}`, {}, { user: admin });
      expect(response.status).toBe(204);
      shop = await Shop.findByIdDeleted(shop.id);
      expect(shop.deletedAt).toBeDefined();

      const auditEntry = await AuditEntry.findOne({
        objectId: shop.id,
      });
      expect(auditEntry.activity).toBe('Deleted shop');
      expect(auditEntry.actor).toEqual(admin._id);
      expect(auditEntry.ownerId).toBe(owner.id);
    });

    it('should allow owner to delete shop', async () => {
      const owner = await createUser();
      let shop = await Shop.create({
        name: 'test 1',
        description: 'Some description',
        owner: owner.id,
      });
      const response = await request('DELETE', `/1/shops/${shop.id}`, {}, { user: owner });
      expect(response.status).toBe(204);
      shop = await Shop.findByIdDeleted(shop.id);
      expect(shop.deletedAt).toBeDefined();

      const auditEntry = await AuditEntry.findOne({
        objectId: shop.id,
      });
      expect(auditEntry.activity).toBe('Deleted shop');
      expect(auditEntry.actor).toEqual(owner._id);
      expect(auditEntry.ownerId).toBe(owner.id);
    });

    it('should not allow anyone to delete shop', async () => {
      const user = await createUser();
      const owner = await createUser();
      let shop = await Shop.create({
        name: 'test 1',
        description: 'Some description',
        owner: owner.id,
      });
      const response = await request('DELETE', `/1/shops/${shop.id}`, {}, { user });
      expect(response.status).toBe(401);
    });
  });
});

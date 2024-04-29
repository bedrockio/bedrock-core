const mongoose = require('mongoose');
const { createTestModel } = require('@bedrockio/model');
const { isEqual } = require('../document');

describe('isEqual', () => {
  describe('ids', () => {
    it('should compare two object ids', async () => {
      expect(
        isEqual(
          new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f'),
          new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f')
        )
      ).toBe(true);

      expect(
        isEqual(
          new mongoose.Types.ObjectId('662f11c8af6870637eab9f0d'),
          new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f')
        )
      ).toBe(false);

      expect(
        isEqual(
          new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f'),
          new mongoose.Types.ObjectId('662f11c8af6870637eab9f0d')
        )
      ).toBe(false);
    });

    it('should compare an object id and a string', async () => {
      expect(isEqual(new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f'), '662f11c8af6870637eab9f0f')).toBe(true);
      expect(isEqual(new mongoose.Types.ObjectId('662f11c8af6870637eab9f0d'), '662f11c8af6870637eab9f0f')).toBe(false);
      expect(isEqual(new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f'), '662f11c8af6870637eab9f0d')).toBe(false);

      expect(isEqual('662f11c8af6870637eab9f0f', new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f'))).toBe(true);
      expect(isEqual('662f11c8af6870637eab9f0d', new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f'))).toBe(false);
      expect(isEqual('662f11c8af6870637eab9f0f', new mongoose.Types.ObjectId('662f11c8af6870637eab9f0d'))).toBe(false);
    });
  });

  describe('documents', () => {
    const Shop = createTestModel({
      name: 'String',
    });

    it('should compare two documents', async () => {
      const shop1 = await Shop.create({
        name: 'Shop',
      });

      const shop2 = await Shop.create({
        name: 'Shop 2',
      });
      expect(isEqual(shop1, shop1)).toBe(true);
      expect(isEqual(shop1, shop2)).toBe(false);
      expect(isEqual(shop2, shop1)).toBe(false);
    });

    it('should compare a document and an object id', async () => {
      const shop = await Shop.create({
        name: 'Shop',
      });

      expect(isEqual(shop, new mongoose.Types.ObjectId(String(shop._id)))).toBe(true);
      expect(isEqual(shop, new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f'))).toBe(false);

      expect(isEqual(new mongoose.Types.ObjectId(String(shop._id)), shop)).toBe(true);
      expect(isEqual(new mongoose.Types.ObjectId('662f11c8af6870637eab9f0f'), shop)).toBe(false);
    });

    it('should compare a document and a string', async () => {
      const shop = await Shop.create({
        name: 'Shop',
      });

      expect(isEqual(shop, shop.id)).toBe(true);
      expect(isEqual(shop, '662f11c8af6870637eab9f0f')).toBe(false);

      expect(isEqual(shop.id, shop)).toBe(true);
      expect(isEqual('662f11c8af6870637eab9f0f', shop)).toBe(false);
    });
  });
});

const { createSchema, loadModel, loadModelDir } = require('../schema');
const mongoose = require('mongoose');
const { setupDb, teardownDb } = require('../../../test-helpers');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

let counter = 0;

function createTestModel(schema) {
  return mongoose.model(`SchemaTestModel${counter++}`, schema);
}

describe('createSchema', () => {
  describe('basic functionality', () => {
    it('should be able to create basic schema', async () => {
      const User = createTestModel(
        createSchema({
          name: { type: String, validate: /[a-z]/ },
        })
      );
      const user = new User({ name: 'foo' });

      expect(user.name).toBe('foo');

      await expect(async () => {
        user.name = 'FOO';
        await user.save();
      }).rejects.toThrow();
    });
  });

  describe('defaults', () => {
    it('should add timestamps by default', async () => {
      const User = createTestModel(createSchema());
      const user = new User();
      await user.save();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should add deletedAt by default', async () => {
      const User = createTestModel(createSchema());
      const user = new User();
      await user.save();
      await user.delete();
      expect(user.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('serialization', () => {
    it('should expose id', () => {
      const User = createTestModel(createSchema());
      const user = new User();
      const data = user.toObject();
      expect(data.id).toBe(user.id);
    });

    it('should not expose _id or __v', () => {
      const User = createTestModel(createSchema());
      const user = new User();
      const data = user.toObject();
      expect(data._id).toBeUndefined();
      expect(data.__v).toBeUndefined();
    });

    it('should not expose fields with underscore or marked private', () => {
      const User = createTestModel(
        createSchema({
          _private: String,
          password: { type: String, access: 'private' },
        })
      );
      const user = new User();
      user._private = 'private';
      user.password = 'fake password';

      expect(user._private).toBe('private');
      expect(user.password).toBe('fake password');

      const data = user.toObject();

      expect(data._private).toBeUndefined();
      expect(data.password).toBeUndefined();
    });

    it('should not expose array fields marked private', () => {
      const User = createTestModel(
        createSchema({
          tags: [{ type: String, access: 'private' }],
        })
      );
      const user = new User();
      user.tags = ['one', 'two'];

      expect(user.tags).toBeInstanceOf(Array);

      const data = user.toObject();
      expect(data.tags).toBeUndefined();
    });

    it('should serialize identically with toObject', () => {
      const User = createTestModel(
        createSchema({
          secret: { type: String, access: 'private' },
        })
      );
      const user = new User({
        secret: 'foo',
      });
      const data = user.toObject();
      expect(data.id).toBe(user.id);
      expect(data._id).toBeUndefined();
      expect(data.__v).toBeUndefined();
      expect(data.secret).toBeUndefined();
    });

    it('should allow access to private fields with options on toJSON', () => {
      const User = createTestModel(
        createSchema({
          secret: { type: String, access: 'private' },
        })
      );
      const user = new User({
        secret: 'foo',
      });
      const data = user.toJSON({
        private: true,
      });
      expect(data.id).toBe(user.id);
      expect(data._id).toBeUndefined();
      expect(data.__v).toBeUndefined();
      expect(data.secret).toBe('foo');
    });

    it('should allow access to private fields with options on toObject', () => {
      const User = createTestModel(
        createSchema({
          secret: { type: String, access: 'private' },
        })
      );
      const user = new User({
        secret: 'foo',
      });
      const data = user.toObject({
        private: true,
      });
      expect(data.id).toBe(user.id);
      expect(data._id).toBeUndefined();
      expect(data.__v).toBeUndefined();
      expect(data.secret).toBe('foo');
    });
  });

  describe('assign', () => {
    it('should allow assignment of fields', async () => {
      const User = createTestModel(
        createSchema({
          name: { type: String },
          fakeId: { type: Number },
          fakeDate: { type: Date },
        })
      );
      const user = new User();
      const now = Date.now();
      user.assign({
        name: 'fake name',
        fakeNumber: 5,
        fakeDate: new Date(now),
      });
      expect(user.name).toBe('fake name');
      expect(user.fakeNumber).toBe(5);
      expect(user.fakeDate.getTime()).toBe(now);
    });

    it('should not allow assignment of reserved fields', async () => {
      const User = createTestModel(createSchema());
      const user = await User.create({});
      const now = Date.now();
      user.assign({
        id: 'fake id',
        createdAt: new Date(now - 1000),
        updatedAt: new Date(now - 1000),
        deletedAt: new Date(now - 1000),
      });
      expect(user.id).not.toBe('fake id');
      expect(user._id.toString()).not.toBe('fake id');
      expect(user.createdAt.getTime()).not.toBe(now - 1000);
      expect(user.updatedAt.getTime()).not.toBe(now - 1000);
      expect(user.deletedAt).toBeUndefined();
    });

    it('should not allow assignment of private fields', async () => {
      const User = createTestModel(
        createSchema({
          password: { type: String, access: 'private' },
        })
      );
      const user = new User();
      user.assign({
        password: 'fake password',
      });
      await user.save();
      expect(user.password).not.toBe('fake password');
    });

    it('should delete falsy values for reference fields', async () => {
      const User = createTestModel(
        createSchema({
          password: { type: String, access: 'private' },
        })
      );
      const Shop = createTestModel(
        createSchema({
          user: {
            ref: User.modelName,
            type: mongoose.Schema.Types.ObjectId,
          },
        })
      );
      const shop = new Shop({
        user: '5f63b1b88f09266f237e9d29',
      });
      await shop.save();

      let data = JSON.parse(JSON.stringify(shop));
      expect(data.user).toBe('5f63b1b88f09266f237e9d29');
      shop.assign({
        user: '',
      });
      await shop.save();
      data = JSON.parse(JSON.stringify(shop));
      expect('user' in data).toBe(false);
    });

    it('should still allow assignment of empty arrays for multi-reference fields', async () => {
      const User = createTestModel(
        createSchema({
          password: { type: String, access: 'private' },
        })
      );
      const Shop = createTestModel(
        createSchema({
          users: [
            {
              ref: User.modelName,
              type: mongoose.Schema.Types.ObjectId,
            },
          ],
        })
      );
      const shop = new Shop({
        users: ['5f63b1b88f09266f237e9d29', '5f63b1b88f09266f237e9d29'],
      });
      await shop.save();

      let data = JSON.parse(JSON.stringify(shop));
      expect(data.users).toEqual(['5f63b1b88f09266f237e9d29', '5f63b1b88f09266f237e9d29']);
      shop.assign({
        users: [],
      });
      await shop.save();
      data = JSON.parse(JSON.stringify(shop));
      expect(data.users).toEqual([]);
    });
  });

  describe('autopopulate', () => {
    it('should not expose private fields when using with autopopulate', async () => {
      const User = createTestModel(
        createSchema({
          password: { type: String, access: 'private' },
        })
      );
      const shopSchema = createSchema({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: true,
        },
      });

      shopSchema.plugin(require('mongoose-autopopulate'));
      const Shop = createTestModel(shopSchema);

      const user = new User();
      user.password = 'fake password';
      await user.save();

      let shop = new Shop();
      shop.user = user;
      await shop.save();

      shop = await Shop.findById(shop.id);

      const data = JSON.parse(JSON.stringify(shop));

      expect(data.user.id).toBe(user.id);
      expect(data.user._id).toBeUndefined();
      expect(data.user.__v).toBeUndefined();
      expect(data.user.password).toBeUndefined();
    });

    it('should not allow access to private autopoulated fields by default', async () => {
      const User = createTestModel(
        createSchema({
          secret: { type: String, access: 'private' },
        })
      );

      const shopSchema = createSchema({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: true,
        },
      });

      shopSchema.plugin(require('mongoose-autopopulate'));
      const Shop = createTestModel(shopSchema);

      const user = new User({
        secret: 'foo',
      });
      await user.save();

      let shop = new Shop();
      shop.user = user;
      await shop.save();

      shop = await Shop.findById(shop.id);

      const data = shop.toObject();

      expect(data.user.id).toBe(user.id);
      expect(data.user._id).toBeUndefined();
      expect(data.user.__v).toBeUndefined();
      expect(data.user.secret).toBeUndefined();
    });

    it('should allow access to private autopoulated fields with options', async () => {
      const User = createTestModel(
        createSchema({
          secret: { type: String, access: 'private' },
        })
      );

      const shopSchema = createSchema({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: true,
        },
      });

      shopSchema.plugin(require('mongoose-autopopulate'));
      const Shop = createTestModel(shopSchema);

      const user = new User({
        secret: 'foo',
      });
      await user.save();

      let shop = new Shop();
      shop.user = user;
      await shop.save();

      shop = await Shop.findById(shop.id);

      const data = shop.toObject({
        private: true,
      });

      expect(data.user.id).toBe(user.id);
      expect(data.user._id).toBeUndefined();
      expect(data.user.__v).toBeUndefined();
      expect(data.user.secret).toBe('foo');
    });
  });
});

describe('loadModel', () => {
  it('should be able to create basic model', async () => {
    expect(!!mongoose.models.Box).toBe(false);
    const Box = loadModel(
      {
        attributes: {
          name: { type: String, validate: /[a-z]/ },
        },
      },
      'Box'
    );
    expect(!!mongoose.models.Box).toBe(true);
    const box = new Box({ name: 'foo' });

    expect(box.name).toBe('foo');

    await expect(async () => {
      box.name = 'FOO';
      await box.save();
    }).rejects.toThrow();
  });
});

describe('loadModelDir', () => {
  it('should be able to create models from a folder', async () => {
    expect(!!mongoose.models.SpecialCategory).toBe(false);
    expect(!!mongoose.models.CustomModel).toBe(false);
    loadModelDir(__dirname + '/fixtures');
    expect(!!mongoose.models.SpecialCategory).toBe(true);
    //expect(!!mongoose.models.CustomModel).toBe(false);
    const { SpecialCategory } = mongoose.models;
    await SpecialCategory.deleteMany({});
    const someRef = mongoose.Types.ObjectId();
    const category = new SpecialCategory({ name: 'foo', someRef, count: 3 });
    await category.save();
    const foundCategory = await SpecialCategory.findOne();
    expect(foundCategory.name).toBe('foo');
    expect(foundCategory.someRef.toString()).toBe(someRef.toString());
    expect(foundCategory.count).toBe(3);
  });
});

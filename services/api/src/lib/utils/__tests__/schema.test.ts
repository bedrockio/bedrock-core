import { createSchema } from '../schema';
import mongoose from 'mongoose';
import { setupDb, teardownDb } from '../../../test-helpers';

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});


let counter = 0;

function createModel(schema) {
  return mongoose.model(`SchemaTestModel${counter++}`, schema);
}

describe('createSchema', () => {

  describe('basic functionality', () => {

    it('should be able to create basic schema', async () => {
      const User = createModel(createSchema({
        name: { type: String, validate: /[a-z]/ }
      }));
      const user = new User({ name: 'foo' });

      // @ts-ignore: TODO fix
      expect(user.name).toBe('foo');

      await expect(async () => {
        // @ts-ignore: TODO fix
        user.name = 'FOO';
        await user.save();
      }).rejects.toThrow();

    });
  });

  describe('defaults', () => {

    it('should add timestamps by default', async () => {
      const User = createModel(createSchema());
      const user = new User();
      await user.save();
      // @ts-ignore: TODO fix
      expect(user.createdAt).toBeInstanceOf(Date);
      // @ts-ignore: TODO fix
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should add deletedAt by default', async () => {
      const User = createModel(createSchema());
      const user = new User();
      await user.save();
      // @ts-ignore: TODO fix
      await user.delete();
      // @ts-ignore: TODO fix
      expect(user.deletedAt).toBeInstanceOf(Date);
    });

  });

  describe('serialization', () => {

    it('should expose id', () => {
      const User = createModel(createSchema());
      const user = new User();
      const data = JSON.parse(JSON.stringify(user));
      expect(data.id).toBe(user.id);
    });

    it('should not expose _id or __v', () => {
      const User = createModel(createSchema());
      const user = new User();
      const data = JSON.parse(JSON.stringify(user));
      expect(data._id).toBeUndefined();
      expect(data.__v).toBeUndefined();
    });

    it('should not expose fields with underscore or marked private', () => {
      const User = createModel(createSchema({
        _private: String,
        password: { type: String, access: 'private' },
      }));
      const user = new User();
      // @ts-ignore: TODO fix
      user._private = 'private';
      // @ts-ignore: TODO fix
      user.password = 'fake password';

      // @ts-ignore: TODO fix
      expect(user._private).toBe('private');
      // @ts-ignore: TODO fix
      expect(user.password).toBe('fake password');

      const data = JSON.parse(JSON.stringify(user));

      expect(data._private).toBeUndefined();
      expect(data.password).toBeUndefined();
    });

    it('should not expose array fields marked private', () => {
      const User = createModel(createSchema({
        tags: [{ type: String, access: 'private' }],
      }));
      const user = new User();
      // @ts-ignore: TODO fix
      user.tags = ['one', 'two'];

      // @ts-ignore: TODO fix
      expect(user.tags).toBeInstanceOf(Array);

      const data = JSON.parse(JSON.stringify(user));
      expect(data.tags).toBeUndefined();
    });

    it('should serialize identically with toObject', () => {
      const User = createModel(createSchema({
        secret: { type: String, access: 'private' },
      }));
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
      const User = createModel(createSchema({
        secret: { type: String, access: 'private' },
      }));
      const user = new User({
        secret: 'foo',
      });
      const data = user.toJSON({
        // @ts-ignore: TODO fix
        private: true,
      });
      expect(data.id).toBe(user.id);
      expect(data._id).toBeUndefined();
      expect(data.__v).toBeUndefined();
      expect(data.secret).toBe('foo');
    });

    it('should allow access to private fields with options on toObject', () => {
      const User = createModel(createSchema({
        secret: { type: String, access: 'private' },
      }));
      const user = new User({
        secret: 'foo',
      });
      const data = user.toObject({
        // @ts-ignore: TODO fix
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
      const User = createModel(createSchema({
        name: { type: String },
        fakeId: { type: Number },
        fakeDate: { type: Date },
      }));
      const user = new User();
      const now = Date.now();
      // @ts-ignore: TODO fix
      user.assign({
        name: 'fake name',
        fakeNumber: 5,
        fakeDate: new Date(now),
      });
      // @ts-ignore: TODO fix
      expect(user.name).toBe('fake name');
      // @ts-ignore: TODO fix
      expect(user.fakeNumber).toBe(5);
      // @ts-ignore: TODO fix
      expect(user.fakeDate.getTime()).toBe(now);
    });

    it('should not allow assignment of reserved fields', async () => {
      const User = createModel(createSchema());
      const user = await User.create({});
      const now = Date.now();
      // @ts-ignore: TODO fix
      user.assign({
        id: 'fake id',
        createdAt: new Date(now - 1000),
        updatedAt: new Date(now - 1000),
        deletedAt: new Date(now - 1000),
      });
      expect(user.id).not.toBe('fake id');
      expect(user._id.toString()).not.toBe('fake id');
      // @ts-ignore: TODO fix
      expect(user.createdAt.getTime()).not.toBe(now - 1000);
      // @ts-ignore: TODO fix
      expect(user.updatedAt.getTime()).not.toBe(now - 1000);
      // @ts-ignore: TODO fix
      expect(user.deletedAt).toBeUndefined();
    });

    it('should not allow assignment of private fields', async () => {
      const User = createModel(createSchema({
        password: { type: String, access: 'private' },
      }));
      const user = new User();
      // @ts-ignore: TODO fix
      user.assign({
        password: 'fake password',
      });
      await user.save();
      // @ts-ignore: TODO fix
      expect(user.password).not.toBe('fake password');
    });

  });

  describe('autopopulate', () => {

    it('should not expose private fields when using with autopopulate', async () => {
      const User = createModel(createSchema({
        password: { type: String, access: 'private' },
      }));

      const shopSchema = createSchema({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: true,
        }
      });

      shopSchema.plugin(require('mongoose-autopopulate'));
      const Shop = createModel(shopSchema);

      const user = new User();
      // @ts-ignore: TODO fix
      user.password = 'fake password';
      await user.save();

      let shop = new Shop();
      // @ts-ignore: TODO fix
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
      const User = createModel(createSchema({
        secret: { type: String, access: 'private' },
      }));

      const shopSchema = createSchema({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: true,
        }
      });

      shopSchema.plugin(require('mongoose-autopopulate'));
      const Shop = createModel(shopSchema);

      const user = new User({
        secret: 'foo'
      });
      await user.save();

      let shop = new Shop();
      // @ts-ignore: TODO fix
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
      const User = createModel(createSchema({
        secret: { type: String, access: 'private' },
      }));

      const shopSchema = createSchema({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: true,
        }
      });

      shopSchema.plugin(require('mongoose-autopopulate'));
      const Shop = createModel(shopSchema);

      const user = new User({
        secret: 'foo'
      });
      await user.save();

      let shop = new Shop();
      // @ts-ignore: TODO fix
      shop.user = user;
      await shop.save();

      shop = await Shop.findById(shop.id);

      const data = shop.toObject({
        // @ts-ignore: TODO fix
        private: true
      });

      expect(data.user.id).toBe(user.id);
      expect(data.user._id).toBeUndefined();
      expect(data.user.__v).toBeUndefined();
      expect(data.user.secret).toBe('foo');
    });
  });
});

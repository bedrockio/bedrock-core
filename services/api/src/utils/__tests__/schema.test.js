const { createSchema, loadModel, loadModelDir } = require('../schema');
const Joi = require('joi');
const mongoose = require('mongoose');
const { setupDb, teardownDb } = require('../testing');

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
    it('should create a basic schema', async () => {
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

    it('should create a schema with an array field', async () => {
      const User = createTestModel(
        createSchema({
          names: [{ type: String, validate: /[a-z]/ }],
        })
      );
      const user = new User({ names: ['foo'] });

      expect(Array.from(user.names)).toEqual(['foo']);

      await expect(async () => {
        user.names = ['FOO'];
        await user.save();
      }).rejects.toThrow();
    });

    it('should create a schema with a nested field', async () => {
      const User = createTestModel(
        createSchema({
          profile: {
            name: { type: String, validate: /[a-z]/ },
          },
        })
      );
      const user = new User({
        profile: {
          name: 'foo',
        },
      });

      expect(user.profile.name).toBe('foo');

      await expect(async () => {
        user.profile.name = 'FOO';
        await user.save();
      }).rejects.toThrow();
    });

    it('should accept a schema for a subfield', async () => {
      const User = createTestModel(
        createSchema({
          profile: createSchema({
            name: { type: String, validate: /[a-z]/ },
          }),
        })
      );
      const user = new User({
        profile: {
          name: 'foo',
        },
      });

      expect(user.profile.name).toBe('foo');

      await expect(async () => {
        user.profile.name = 'FOO';
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

    it('should not expose _id in nested array objects of mixed type', () => {
      const User = createTestModel(
        createSchema({
          names: [
            {
              name: String,
              position: Number,
            },
          ],
        })
      );
      const user = new User({
        names: [
          {
            name: 'Foo',
            position: 2,
          },
        ],
      });
      const data = user.toObject();
      expect(data.names[0]).toEqual({
        name: 'Foo',
        position: 2,
      });
    });

    it('should not expose _id in deeply nested array objects of mixed type', () => {
      const User = createTestModel(
        createSchema({
          one: [{ two: [{ three: [{ name: String, position: Number }] }] }],
        })
      );
      const user = new User({
        one: [{ two: [{ three: [{ name: 'Foo', position: 2 }] }] }],
      });
      const data = user.toObject();
      expect(data).toEqual({
        id: user.id,
        one: [{ two: [{ three: [{ name: 'Foo', position: 2 }] }] }],
      });
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

    it('should not expose deeply nested private fields', () => {
      const User = createTestModel(
        createSchema({
          one: {
            two: {
              three: {
                name: {
                  type: String,
                },
                age: {
                  type: Number,
                  access: 'private',
                },
              },
            },
          },
        })
      );
      const user = new User({
        one: {
          two: {
            three: {
              name: 'Harry',
              age: 21,
            },
          },
        },
      });

      const data = user.toObject();
      expect(data).toEqual({
        id: user.id,
        one: {
          two: {
            three: {
              name: 'Harry',
            },
          },
        },
      });
    });

    it('should not expose private fields deeply nested in arrays', () => {
      const User = createTestModel(
        createSchema({
          one: [
            {
              two: [
                {
                  three: [
                    {
                      name: {
                        type: String,
                      },
                      age: {
                        type: Number,
                        access: 'private',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        })
      );
      const user = new User({
        one: [
          {
            two: [
              {
                three: [
                  {
                    name: 'Harry',
                    age: 21,
                  },
                ],
              },
            ],
          },
        ],
      });

      const data = user.toObject();
      expect(data).toEqual({
        id: user.id,
        one: [
          {
            two: [
              {
                three: [
                  {
                    name: 'Harry',
                  },
                ],
              },
            ],
          },
        ],
      });
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

  describe('mongoose validation shortcuts', () => {
    it('should validate an email field', () => {
      let user;
      const User = createTestModel(
        createSchema({
          email: {
            type: String,
            validate: 'email',
          },
        })
      );

      // TODO: for now we allow both empty strings and null
      // as a potential signal for "set but non-existent".
      // Is this ok? Do we not want any falsy fields in the
      // db whatsoever?

      user = new User({
        email: '',
      });
      expect(user.validateSync()).toBeUndefined();

      user = new User({
        email: null,
      });
      expect(user.validateSync()).toBeUndefined();

      user = new User({
        email: 'good@email.com',
      });
      expect(user.validateSync()).toBeUndefined();

      user = new User({
        email: 'bad@email',
      });
      expect(user.validateSync()).toBeInstanceOf(mongoose.Error.ValidationError);
    });

    it('should validate a required email field', () => {
      let user;
      const User = createTestModel(
        createSchema({
          email: {
            type: String,
            required: true,
            validate: 'email',
          },
        })
      );

      user = new User({
        email: 'good@email.com',
      });
      expect(user.validateSync()).toBeUndefined();

      user = new User({
        email: 'bad@email',
      });
      expect(user.validateSync()).toBeInstanceOf(mongoose.Error.ValidationError);

      user = new User({
        email: '',
      });
      expect(user.validateSync()).toBeInstanceOf(mongoose.Error.ValidationError);
    });

    it('should validate a nested email field', () => {
      let user;
      const User = createTestModel(
        createSchema({
          emails: [
            {
              type: String,
              validate: 'email',
            },
          ],
        })
      );

      user = new User({
        emails: ['good@email.com'],
      });
      expect(user.validateSync()).toBeUndefined();

      user = new User({
        emails: ['bad@email'],
      });
      expect(user.validateSync()).toBeInstanceOf(mongoose.Error.ValidationError);
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

describe('validation', () => {
  function assertPass(schema, obj) {
    expect(() => {
      Joi.assert(obj, schema);
    }).not.toThrow();
  }
  function assertFail(schema, obj) {
    expect(() => {
      Joi.assert(obj, schema);
    }).toThrow();
  }

  describe('create validation', () => {
    it('should get a basic Joi create schema', () => {
      const User = createTestModel(
        createSchema({
          name: {
            type: String,
            required: true,
          },
          count: {
            type: Number,
            required: true,
          },
        })
      );
      const schema = User.getCreateValidation();
      expect(Joi.isSchema(schema)).toBe(true);
      assertPass(schema, {
        name: 'foo',
        count: 10,
      });
      assertFail(schema, {
        name: 'foo',
      });
      assertFail(schema, {
        name: 10,
        count: 10,
      });
      assertFail(schema, {
        foo: 'bar',
      });
    });

    it('should be able to append schemas', () => {
      const User = createTestModel(
        createSchema({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getCreateValidation({
        count: Joi.number().required(),
      });
      expect(Joi.isSchema(schema)).toBe(true);
      assertFail(schema, {
        name: 'foo',
      });
      assertPass(schema, {
        name: 'foo',
        count: 10,
      });
    });
  });

  describe('update validation', () => {
    it('should skip required fields', () => {
      const User = createTestModel(
        createSchema({
          name: {
            type: String,
            required: true,
          },
          count: {
            type: Number,
            required: true,
          },
        })
      );
      const schema = User.getUpdateValidation();
      expect(Joi.isSchema(schema)).toBe(true);
      assertPass(schema, {
        name: 'foo',
      });
      assertPass(schema, {
        count: 10,
      });
      assertFail(schema, {});
    });

    it('should strip schema internal fields', () => {
      const User = createTestModel(
        createSchema({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getUpdateValidation();
      assertPass(schema, {
        name: 'foo',
        id: 'id',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        deletedAt: 'deletedAt',
      });
    });

    it('should strip virtuals', () => {
      const userSchema = createSchema({
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
      });
      userSchema.virtual('fullName').get(function () {
        return `${this.firstName} ${this.lastName}`;
      });
      const User = createTestModel(userSchema);
      const user = new User({
        firstName: 'John',
        lastName: 'Doe',
      });
      const data = user.toObject();
      expect(data).toEqual({
        id: user.id,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
      });
      const schema = User.getUpdateValidation();
      assertPass(schema, data);
      expect(schema.validate(data)).toEqual({
        value: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
    });

    it('should strip nested virtuals', () => {
      const profileSchema = createSchema({
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
      });
      profileSchema.virtual('fullName').get(function () {
        return `${this.firstName} ${this.lastName}`;
      });
      const User = createTestModel(
        createSchema({
          profile: profileSchema,
        })
      );
      const user = new User({
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });
      const data = user.toObject();
      expect(data).toEqual({
        id: user.id,
        profile: {
          id: user.profile.id,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
        },
      });
      const schema = User.getUpdateValidation();
      assertPass(schema, data);
      expect(schema.validate(data)).toEqual({
        value: {
          profile: {
            firstName: 'John',
            lastName: 'Doe',
          },
        },
      });
    });

    it('should fail on private fields', () => {
      const User = createTestModel(
        createSchema({
          name: {
            type: String,
            required: true,
          },
          password: {
            type: String,
            access: 'private',
          },
        })
      );
      const schema = User.getUpdateValidation();
      assertFail(schema, {
        name: 'foo',
        password: 'createdAt',
      });
    });
  });
});

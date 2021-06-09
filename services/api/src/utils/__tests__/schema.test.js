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
  return mongoose.model(`SchemaTestModel${counter++}`, schema || createSchema());
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

    it('should allow alternate array function syntax', async () => {
      const User = createTestModel(
        createSchema({
          names: {
            type: Array,
            default: [],
          },
        })
      );
      const user = new User({ names: ['foo'] });
      expect(Array.from(user.names)).toEqual(['foo']);
    });

    it('should allow alternate array string syntax', async () => {
      const User = createTestModel(
        createSchema({
          names: {
            type: 'Array',
            default: [],
          },
        })
      );
      const user = new User({ names: ['foo'] });
      expect(Array.from(user.names)).toEqual(['foo']);
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
    describe('reserved fields', () => {
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

      it('should not expose fields with underscore', () => {
        const User = createTestModel(
          createSchema({
            _private: String,
          })
        );
        const user = new User();
        user._private = 'private';

        expect(user._private).toBe('private');
        const data = user.toObject();
        expect(data._private).toBeUndefined();
      });
    });

    describe('read scopes', () => {
      it('should be able to disallow all read access', () => {
        const User = createTestModel(
          createSchema({
            password: { type: String, readScopes: 'none' },
          })
        );
        const user = new User();
        user.password = 'fake password';
        expect(user.password).toBe('fake password');
        expect(user.toObject().password).toBeUndefined();
      });

      it('should be able to disallow read access by scope', () => {
        const User = createTestModel(
          createSchema({
            password: { type: String, readScopes: ['admin'] },
          })
        );
        const user = new User();
        user.password = 'fake password';
        expect(user.password).toBe('fake password');
        expect(user.toObject().password).toBeUndefined();
      });

      it('should be able to allow read access by scope', () => {
        const User = createTestModel(
          createSchema({
            password: { type: String, readScopes: ['admin'] },
          })
        );
        const user = new User();
        user.password = 'fake password';
        expect(user.password).toBe('fake password');
        expect(user.toObject({ scopes: ['admin'] }).password).toBe('fake password');
      });

      it('should be able to allow read access to all', () => {
        const User = createTestModel(
          createSchema({
            password: { type: String, readScopes: 'all' },
          })
        );
        const user = new User();
        user.password = 'fake password';
        expect(user.password).toBe('fake password');
        expect(user.toObject().password).toBe('fake password');
      });

      it('should not expose private array fields', () => {
        const User = createTestModel(
          createSchema({
            tags: [{ type: String, readScopes: 'none' }],
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
                    readScopes: 'none',
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
                          readScopes: 'none',
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
            secret: { type: String, readScopes: 'none' },
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
            secret: { type: String, readScopes: ['admin'] },
          })
        );
        const user = new User({
          secret: 'foo',
        });
        const data = user.toJSON({
          scopes: ['admin'],
        });
        expect(data.id).toBe(user.id);
        expect(data._id).toBeUndefined();
        expect(data.__v).toBeUndefined();
        expect(data.secret).toBe('foo');
      });

      it('should allow access to private fields with options on toObject', () => {
        const User = createTestModel(
          createSchema({
            secret: { type: String, readScopes: ['admin'] },
          })
        );
        const user = new User({
          secret: 'foo',
        });
        const data = user.toObject({
          scopes: ['admin'],
        });
        expect(data.id).toBe(user.id);
        expect(data._id).toBeUndefined();
        expect(data.__v).toBeUndefined();
        expect(data.secret).toBe('foo');
      });

      it('should be able to mark access on nested objects', async () => {
        const User = createTestModel(
          createSchema({
            login: {
              password: String,
              attempts: Number,
              readScopes: ['admin'],
            },
          })
        );
        const user = new User({
          login: {
            password: 'password',
            attempts: 10,
          },
        });
        expect(user.login.password).toBe('password');
        expect(user.login.attempts).toBe(10);
        expect(user.toObject().login).toBeUndefined();
      });
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

    it('should delete falsy values for reference fields', async () => {
      const User = createTestModel();
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
      const User = createTestModel();
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
          password: { type: String, readScopes: 'none' },
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

    it('should not allow access to private autopopulated fields by default', async () => {
      const User = createTestModel(
        createSchema({
          secret: { type: String, readScopes: 'none' },
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

    it('should allow access to private autopopulated fields with options', async () => {
      const User = createTestModel(
        createSchema({
          secret: { type: String, readScopes: ['admin'] },
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
        scopes: ['admin'],
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

  describe('soft delete', () => {
    it('should be able to soft delete a document', async () => {
      const User = createTestModel(
        createSchema({
          name: 'String',
        })
      );
      const user = await User.create({
        name: 'foo',
      });
      await user.delete();
      expect(await user.deletedAt).toBeInstanceOf(Date);
    });

    it('should be able to restore a document', async () => {
      const User = createTestModel(
        createSchema({
          name: 'String',
        })
      );
      const user = await User.create({
        name: 'foo',
      });
      await user.delete();
      expect(await user.deletedAt).toBeInstanceOf(Date);
      await user.restore();
      expect(await user.deletedAt).toBeUndefined();
    });

    it('should not query deleted documents by default', async () => {
      const User = createTestModel(
        createSchema({
          name: 'String',
        })
      );
      const deletedUser = await User.create({
        name: 'foo',
        deletedAt: new Date(),
      });
      expect(await User.find()).toEqual([]);
      expect(await User.findOne()).toBe(null);
      expect(await User.findById(deletedUser.id)).toBe(null);
      expect(await User.exists()).toBe(false);
      expect(await User.countDocuments()).toBe(0);
    });

    it('should still be able to query deleted documents', async () => {
      const User = createTestModel(
        createSchema({
          name: 'String',
        })
      );
      const deletedUser = await User.create({
        name: 'foo',
        deletedAt: new Date(),
      });
      expect(await User.findDeleted()).not.toBe(null);
      expect(await User.findOneDeleted()).not.toBe(null);
      expect(await User.findByIdDeleted(deletedUser.id)).not.toBe(null);
      expect(await User.existsDeleted()).toBe(true);
      expect(await User.countDocumentsDeleted()).toBe(1);
    });

    it('should still be able to query with deleted documents', async () => {
      const User = createTestModel(
        createSchema({
          name: 'String',
        })
      );
      await User.create({
        name: 'foo',
      });
      const deletedUser = await User.create({
        name: 'bar',
        deletedAt: new Date(),
      });
      expect((await User.findWithDeleted()).length).toBe(2);
      expect(await User.findOneWithDeleted({ name: 'bar' })).not.toBe(null);
      expect(await User.findByIdWithDeleted(deletedUser.id)).not.toBe(null);
      expect(await User.existsWithDeleted({ name: 'bar' })).toBe(true);
      expect(await User.countDocumentsWithDeleted()).toBe(2);
    });

    it('should be able to hard delete a document', async () => {
      const User = createTestModel(
        createSchema({
          name: 'String',
        })
      );
      const user = await User.create({
        name: 'foo',
      });
      await User.create({
        name: 'foo2',
      });
      await user.destroy();
      expect(await User.countDocumentsWithDeleted()).toBe(1);
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
  function assertPass(schema, obj, options) {
    expect(() => {
      Joi.assert(obj, schema, options);
    }).not.toThrow();
  }
  function assertFail(schema, obj, options) {
    expect(() => {
      Joi.assert(obj, schema, options);
    }).toThrow();
  }

  describe('getCreateValidation', () => {
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

    it('should handle geolocation schema', async () => {
      const User = createTestModel(
        createSchema({
          geoLocation: {
            type: { type: 'String', default: 'Point' },
            coordinates: {
              type: Array,
              default: [],
            },
          },
        })
      );
      const user = await User.create({
        geoLocation: {
          coordinates: [35, 95],
        },
      });
      expect(user.toObject()).toEqual({
        id: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        geoLocation: {
          type: 'Point',
          coordinates: [35, 95],
        },
      });
      const schema = User.getCreateValidation();
      assertPass(schema, {
        geoLocation: {
          type: 'Line',
          coordinates: [35, 95],
        },
      });
      assertFail(schema, {
        geoLocation: 'Line',
      });
    });

    it('should not require a field with a default', () => {
      const User = createTestModel(
        createSchema({
          name: {
            type: String,
            required: true,
          },
          type: {
            type: String,
            required: true,
            enum: ['foo', 'bar'],
            default: 'foo',
          },
        })
      );
      const schema = User.getCreateValidation();
      expect(Joi.isSchema(schema)).toBe(true);
      assertPass(schema, {
        name: 'foo',
      });
    });
  });

  describe('getUpdateValidation', () => {
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

    it('should not enforce a schema on unstructured objects', () => {
      const User = createTestModel(
        createSchema({
          profile: {
            name: 'String',
          },
          devices: [
            {
              type: 'Object',
            },
          ],
        })
      );
      const schema = User.getUpdateValidation();
      expect(Joi.isSchema(schema)).toBe(true);
      assertPass(schema, {
        devices: [
          {
            id: 'id',
            name: 'name',
            class: 'class',
          },
        ],
      });
      assertPass(schema, {
        profile: {
          name: 'foo',
        },
        devices: [
          {
            id: 'id',
            name: 'name',
            class: 'class',
          },
        ],
      });
      assertFail(schema, {
        profile: {
          foo: 'bar',
        },
        devices: [
          {
            id: 'id',
            name: 'name',
            class: 'class',
          },
        ],
      });
    });

    it('should strip reserved fields', () => {
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

    describe('write scopes', () => {
      it('should be able to disallow all write access', async () => {
        const User = createTestModel(
          createSchema({
            name: {
              type: String,
            },
            password: {
              type: String,
              writeScopes: 'none',
            },
          })
        );
        const schema = User.getUpdateValidation();
        assertPass(schema, {
          name: 'Barry',
        });
        assertFail(schema, {
          name: 'Barry',
          password: 'fake password',
        });
      });

      it('should be able to disallow write access by scope', async () => {
        const User = createTestModel(
          createSchema({
            name: {
              type: String,
            },
            password: {
              type: String,
              writeScopes: ['private'],
            },
          })
        );
        const schema = User.getUpdateValidation();
        assertPass(schema, {
          name: 'Barry',
        });
        assertFail(schema, {
          name: 'Barry',
          password: 'fake password',
        });
        assertPass(
          schema,
          {
            name: 'Barry',
            password: 'fake password',
          },
          { scopes: ['private'] }
        );
      });

      it('should require only one of valid scopes', async () => {
        const User = createTestModel(
          createSchema({
            foo: {
              type: String,
              writeScopes: ['foo'],
            },
            bar: {
              type: String,
              writeScopes: ['bar'],
            },
            foobar: {
              type: String,
              writeScopes: ['foo', 'bar'],
            },
          })
        );
        const schema = User.getUpdateValidation();

        // With ['foo'] scopes
        assertPass(
          schema,
          {
            foo: 'foo!',
          },
          { scopes: ['foo'] }
        );
        assertFail(
          schema,
          {
            bar: 'bar!',
          },
          { scopes: ['foo'] }
        );
        assertPass(
          schema,
          {
            foobar: 'foobar!',
          },
          { scopes: ['foo'] }
        );
        assertPass(
          schema,
          {
            foo: 'foo!',
            foobar: 'foobar!',
          },
          { scopes: ['foo'] }
        );
        assertFail(
          schema,
          {
            foo: 'foo!',
            bar: 'bar!',
            foobar: 'foobar!',
          },
          { scopes: ['foo'] }
        );

        // With ['bar'] scopes
        assertFail(
          schema,
          {
            foo: 'foo!',
          },
          { scopes: ['bar'] }
        );
        assertPass(
          schema,
          {
            bar: 'bar!',
          },
          { scopes: ['bar'] }
        );
        assertPass(
          schema,
          {
            foobar: 'foobar!',
          },
          { scopes: ['bar'] }
        );
        assertFail(
          schema,
          {
            foo: 'foo!',
            foobar: 'foobar!',
          },
          { scopes: ['bar'] }
        );
        assertFail(
          schema,
          {
            foo: 'foo!',
            bar: 'bar!',
            foobar: 'foobar!',
          },
          { scopes: ['bar'] }
        );

        // With ['foo', 'bar'] scopes
        assertPass(
          schema,
          {
            foo: 'foo!',
          },
          { scopes: ['foo', 'bar'] }
        );
        assertPass(
          schema,
          {
            bar: 'bar!',
          },
          { scopes: ['foo', 'bar'] }
        );
        assertPass(
          schema,
          {
            foobar: 'foobar!',
          },
          { scopes: ['foo', 'bar'] }
        );
        assertPass(
          schema,
          {
            foo: 'foo!',
            foobar: 'foobar!',
          },
          { scopes: ['foo', 'bar'] }
        );
        assertPass(
          schema,
          {
            foo: 'foo!',
            bar: 'bar!',
            foobar: 'foobar!',
          },
          { scopes: ['foo', 'bar'] }
        );
      });
    });

    it('should allow search on a nested field', () => {
      const User = createTestModel(
        createSchema({
          roles: [
            {
              role: { type: 'String', required: true },
              scope: { type: 'String', required: true },
            },
          ],
        })
      );
      const schema = User.getSearchValidation();
      assertPass(schema, {
        roles: {
          role: 'test',
        },
      });
    });
  });

  describe('getSearchValidation', () => {
    it('should get a basic search schema allowing empty', () => {
      const User = createTestModel(
        createSchema({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getSearchValidation();
      expect(Joi.isSchema(schema)).toBe(true);
      assertPass(schema, {
        name: 'foo',
      });
      assertPass(schema, {});
    });

    it('should mixin default search schema', () => {
      const User = createTestModel(
        createSchema({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getSearchValidation();
      assertPass(schema, {
        name: 'foo',
        keyword: 'keyword',
        startAt: '2020-01-01T00:00:00',
        endAt: '2020-01-01T00:00:00',
        skip: 1,
        limit: 5,
        sort: {
          field: 'createdAt',
          order: 'desc',
        },
        // TODO: validate better?
        ids: ['12345'],
      });
    });
  });
});

describe('search', () => {
  it('should search on name', async () => {
    const User = createTestModel(
      createSchema({
        name: {
          type: String,
          required: true,
        },
      })
    );
    await Promise.all([User.create({ name: 'Billy' }), User.create({ name: 'Willy' })]);
    const { data, meta } = await User.search({ name: 'Billy' });
    expect(data.length).toBe(1);
    expect(data[0].name).toBe('Billy');
    expect(meta.total).toBe(1);
    expect(meta.skip).toBeUndefined();
    expect(meta.limit).toBeUndefined();
  });

  it('should search on name as a keyword', async () => {
    const User = createTestModel(
      createSchema({
        name: {
          type: String,
          required: true,
        },
      })
    );
    await Promise.all([User.create({ name: 'Billy' }), User.create({ name: 'Willy' })]);
    const { data, meta } = await User.search({ keyword: 'billy' });
    expect(data.length).toBe(1);
    expect(data[0].name).toBe('Billy');
    expect(meta.total).toBe(1);
  });

  it('should search on an array field', async () => {
    const User = createTestModel(
      createSchema({
        order: Number,
        categories: [
          {
            type: String,
          },
        ],
      })
    );
    const [user1, user2] = await Promise.all([
      User.create({ order: 1, categories: ['owner', 'member'] }),
      User.create({ order: 2, categories: ['owner'] }),
    ]);

    let result;
    result = await User.search({
      categories: ['member'],
    });
    expect(result.data.length).toBe(1);
    expect(result.data[0].id).toBe(user1.id);
    expect(result.meta.total).toBe(1);

    result = await User.search({
      categories: [],
      sort: {
        field: 'order',
        order: 'asc',
      },
    });
    expect(result.data.length).toBe(2);
    expect(result.data[0].id).toBe(user1.id);
    expect(result.data[1].id).toBe(user2.id);
    expect(result.meta.total).toBe(2);
  });

  it('should be able to perform a search on a nested field', async () => {
    const User = createTestModel(
      createSchema({
        order: Number,
        roles: [
          {
            role: { type: 'String', required: true },
            scope: { type: 'String', required: true },
          },
        ],
      })
    );
    const [user1, user2] = await Promise.all([
      User.create({
        order: 1,
        roles: [
          { role: 'owner', scope: 'global' },
          { role: 'member', scope: 'global' },
        ],
      }),
      User.create({
        order: 2,
        roles: [{ role: 'member', scope: 'global' }],
      }),
    ]);

    let result;
    result = await User.search({
      roles: {
        role: 'member',
      },
      sort: {
        field: 'order',
        order: 'asc',
      },
    });
    expect(result.data.length).toBe(2);
    expect(result.data[0].id).toBe(user1.id);
    expect(result.data[1].id).toBe(user2.id);
    expect(result.meta.total).toBe(2);
  });
});

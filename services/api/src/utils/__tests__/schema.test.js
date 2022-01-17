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
  return mongoose.model(`SchemaTestModel${counter++}`, schema || createSchemaFromAttributes());
}

function createSchemaFromAttributes(attributes = {}) {
  return createSchema({ attributes });
}

describe('createSchema', () => {
  describe('basic functionality', () => {
    it('should create a basic schema', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
          profile: createSchemaFromAttributes({
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

    it('should convert a string match to a regexp', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          color: { type: String, match: '^#[0-9a-f]{6}$' },
        })
      );
      const user = await User.create({
        color: '#ffffff',
      });

      await expect(async () => {
        user.color = 'foo';
        await user.save();
      }).rejects.toThrow();
    });

    it('should convert native functions to mongoose', async () => {
      const schema = createSchemaFromAttributes({
        name: String,
      });
      expect(schema.obj.name).toBe(mongoose.Schema.Types.String);
    });
  });

  describe('defaults', () => {
    it('should add timestamps by default', async () => {
      const User = createTestModel(createSchemaFromAttributes());
      const user = new User();
      await user.save();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should add deletedAt by default', async () => {
      const User = createTestModel(createSchemaFromAttributes());
      const user = new User();
      await user.save();
      await user.delete();
      expect(user.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('serialization', () => {
    describe('reserved fields', () => {
      it('should expose id', () => {
        const User = createTestModel(createSchemaFromAttributes());
        const user = new User();
        const data = user.toObject();
        expect(data.id).toBe(user.id);
      });

      it('should not expose _id or __v', () => {
        const User = createTestModel(createSchemaFromAttributes());
        const user = new User();
        const data = user.toObject();
        expect(data._id).toBeUndefined();
        expect(data.__v).toBeUndefined();
      });

      it('should not expose _id in nested array objects of mixed type', () => {
        const User = createTestModel(
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
            password: { type: String, readScopes: ['admin'] },
          })
        );
        const user = new User();
        user.password = 'fake password';
        expect(user.password).toBe('fake password');
        expect(user.toObject({ scopes: ['admin'] }).password).toBe('fake password');
      });

      it('should allow string shortcut for scopes', () => {
        const User = createTestModel(
          createSchemaFromAttributes({
            password: { type: String, readScopes: ['admin'] },
          })
        );
        const user = new User();
        user.password = 'fake password';
        expect(user.password).toBe('fake password');
        expect(user.toObject({ scope: 'admin' }).password).toBe('fake password');
      });

      it('should be able to allow read access to all', () => {
        const User = createTestModel(
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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

      it('should be able to disallow access on nested objects', async () => {
        const User = createTestModel(
          createSchemaFromAttributes({
            terms: {
              type: {
                readScopes: 'none',
              },
              service: Boolean,
              privacy: Boolean,
            },
          })
        );
        const user = new User({
          terms: {
            service: true,
            privacy: true,
          },
        });
        expect(user.terms).toEqual({ service: true, privacy: true });
        expect(user.toObject().terms).toBeUndefined();
      });
    });
  });

  describe('assign', () => {
    it('should allow assignment of fields', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: { type: String },
          number: { type: Number },
          date: { type: Date },
        })
      );
      const user = new User();
      const now = Date.now();
      user.assign({
        name: 'fake name',
        number: 5,
        date: new Date(now),
      });
      expect(user.name).toBe('fake name');
      expect(user.number).toBe(5);
      expect(user.date.getTime()).toBe(now);
    });

    it('should delete falsy values for reference fields', async () => {
      const User = createTestModel();
      const Shop = createTestModel(
        createSchemaFromAttributes({
          user: {
            ref: User.modelName,
            type: mongoose.Schema.Types.ObjectId,
          },
          nested: {
            name: String,
            user: {
              ref: User.modelName,
              type: mongoose.Schema.Types.ObjectId,
            },
          },
        })
      );
      const id = mongoose.Types.ObjectId().toString();
      const shop = new Shop({
        user: id,
        nested: {
          name: 'fake',
          user: id,
        },
      });
      await shop.save();

      let data = JSON.parse(JSON.stringify(shop));
      expect(data).toMatchObject({
        user: id,
        nested: {
          name: 'fake',
          user: id,
        },
      });
      shop.assign({
        user: '',
        nested: {
          user: '',
        },
      });
      await shop.save();

      data = JSON.parse(JSON.stringify(shop));
      expect(data.user).toBeUndefined();
      expect(data.nested).toEqual({
        name: 'fake',
      });
    });

    it('should still allow assignment of empty arrays for multi-reference fields', async () => {
      const User = createTestModel();
      const Shop = createTestModel(
        createSchemaFromAttributes({
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

    it('should allow partial assignment of nested fields', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          profile: {
            firstName: String,
            lastName: String,
          },
        })
      );

      const user = await User.create({
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      });

      user.assign({
        profile: {
          firstName: 'Jane',
        },
      });
      await user.save();

      expect(user.profile.firstName).toEqual('Jane');
      expect(user.profile.lastName).toEqual('Doe');
    });
  });

  describe('autopopulate', () => {
    it('should not expose private fields when using with autopopulate', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          password: { type: String, readScopes: 'none' },
        })
      );
      const shopSchema = createSchemaFromAttributes({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: true,
        },
      });

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
        createSchemaFromAttributes({
          secret: { type: String, readScopes: 'none' },
        })
      );

      const shopSchema = createSchemaFromAttributes({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: true,
        },
      });

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
        createSchemaFromAttributes({
          secret: { type: String, readScopes: ['admin'] },
        })
      );

      const shopSchema = createSchemaFromAttributes({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
          autopopulate: true,
        },
      });

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

    it('should autopopulate to a depth of 1 by default', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: { type: String },
        })
      );

      const Shop = createTestModel(
        createSchemaFromAttributes({
          user: {
            ref: User.modelName,
            type: 'ObjectId',
            autopopulate: true,
          },
        })
      );

      const Product = createTestModel(
        createSchemaFromAttributes({
          shop: {
            ref: Shop.modelName,
            type: 'ObjectId',
            autopopulate: true,
          },
        })
      );

      const user = await User.create({
        name: 'Marlon',
      });

      const shop = await Shop.create({
        user,
      });

      const product = await Product.create({
        shop,
      });

      expect(product.shop.user.toString()).toBe(user.id);
    });

    it('should respect autopopulate options per field', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: { type: String },
        })
      );

      const Shop = createTestModel(
        createSchemaFromAttributes({
          user: {
            ref: User.modelName,
            type: 'ObjectId',
            autopopulate: true,
          },
        })
      );

      const Product = createTestModel(
        createSchemaFromAttributes({
          shop: {
            ref: Shop.modelName,
            type: 'ObjectId',
            autopopulate: {
              maxDepth: 2,
            },
          },
        })
      );

      const user = await User.create({
        name: 'Marlon',
      });

      const shop = await Shop.create({
        user,
      });

      const product = await Product.create({
        shop,
      });

      expect(product.shop.user).toMatchObject({
        name: 'Marlon',
      });
    });
  });

  describe('mongoose validation shortcuts', () => {
    it('should validate an email field', () => {
      let user;
      const User = createTestModel(
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
          name: 'String',
        })
      );
      const deletedUser = await User.create({
        name: 'foo',
        deletedAt: new Date(),
        deleted: true,
      });
      expect(await User.find()).toEqual([]);
      expect(await User.findOne()).toBe(null);
      expect(await User.findById(deletedUser.id)).toBe(null);
      expect(await User.exists()).toBe(false);
      expect(await User.countDocuments()).toBe(0);
    });

    it('should still be able to query deleted documents', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: 'String',
        })
      );
      const deletedUser = await User.create({
        name: 'foo',
        deletedAt: new Date(),
        deleted: true,
      });
      expect(await User.findDeleted()).not.toBe(null);
      expect(await User.findOneDeleted()).not.toBe(null);
      expect(await User.findByIdDeleted(deletedUser.id)).not.toBe(null);
      expect(await User.existsDeleted()).toBe(true);
      expect(await User.countDocumentsDeleted()).toBe(1);
    });

    it('should still be able to query with deleted documents', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: 'String',
        })
      );
      await User.create({
        name: 'foo',
      });
      const deletedUser = await User.create({
        name: 'bar',
        deletedAt: new Date(),
        deleted: true,
      });
      expect((await User.findWithDeleted()).length).toBe(2);
      expect(await User.findOneWithDeleted({ name: 'bar' })).not.toBe(null);
      expect(await User.findByIdWithDeleted(deletedUser.id)).not.toBe(null);
      expect(await User.existsWithDeleted({ name: 'bar' })).toBe(true);
      expect(await User.countDocumentsWithDeleted()).toBe(2);
    });

    it('should be able to hard delete a document', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
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
    loadModelDir(__dirname + '/../__fixtures__');
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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

    it('should allow a flag to skip required', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: {
            type: String,
            required: true,
          },
          age: {
            type: Number,
            required: true,
            skipValidation: true,
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
      const userSchema = createSchemaFromAttributes({
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
      const profileSchema = createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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

      it('should be able to strip write scope validation fields', async () => {
        const User = createTestModel(
          createSchemaFromAttributes({
            name: {
              type: String,
            },
            password: {
              type: String,
              writeScopes: 'none',
              skipValidation: true,
            },
          })
        );
        const schema = User.getUpdateValidation();
        assertPass(schema, {
          name: 'Barry',
        });

        const { value } = schema.validate({
          name: 'Barry',
          password: 'fake password',
        });
        expect(value.name).toBe('Barry');
        expect(value.password).toBeUndefined();
      });

      it('should be able to disallow write access by scope', async () => {
        const User = createTestModel(
          createSchemaFromAttributes({
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
          createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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

    it('should not strip validation with skip flag', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: {
            type: String,
            required: true,
          },
          age: {
            type: Number,
            required: true,
            skipValidation: true,
            default: 10,
          },
        })
      );
      const schema = User.getUpdateValidation();
      expect(Joi.isSchema(schema)).toBe(true);
      assertPass(schema, {
        name: 'foo',
        age: 25,
      });
      const { value } = schema.validate({
        name: 'foo',
        age: 25,
      });
      expect(value.age).toBe(25);
    });
  });

  describe('getSearchValidation', () => {
    it('should get a basic search schema allowing empty', () => {
      const User = createTestModel(
        createSchemaFromAttributes({
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
        createSchemaFromAttributes({
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

    it('should allow an array for a string field', () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getSearchValidation();
      expect(Joi.isSchema(schema)).toBe(true);
      assertPass(schema, {
        name: ['foo', 'bar'],
      });
      assertPass(schema, {});
    });

    it('should allow range based search', () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          age: Number,
          date: Date,
        })
      );
      const schema = User.getSearchValidation();
      expect(Joi.isSchema(schema)).toBe(true);
      assertPass(schema, {
        age: { gte: 5 },
      });
      assertPass(schema, {
        date: { gte: '2020-01-01' },
      });
      assertPass(schema, {});
    });
  });
});

describe('search', () => {
  it('should search on name', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
        name: {
          type: String,
          required: true,
        },
      })
    );
    await Promise.all([User.create({ name: 'Billy' }), User.create({ name: 'Willy' })]);
    const { data, meta } = await User.search({ name: 'Billy' });
    expect(data).toMatchObject([{ name: 'Billy' }]);
    expect(meta).toEqual({
      total: 1,
      limit: 50,
      skip: 0,
    });
  });

  it('should search on name as a keyword', async () => {
    const schema = createSchemaFromAttributes({
      name: {
        type: String,
        required: true,
      },
    });
    schema.index({
      name: 'text',
    });
    const User = createTestModel(schema);
    await Promise.all([User.create({ name: 'Billy' }), User.create({ name: 'Willy' })]);
    const { data, meta } = await User.search({ keyword: 'billy' });
    expect(data).toMatchObject([{ name: 'Billy' }]);
    expect(meta.total).toBe(1);
  });

  it('should allow partial text match when search fields are defined', async () => {
    let result;
    const schema = createSchema({
      attributes: {
        name: {
          type: String,
          required: true,
        },
      },
      search: ['name'],
    });
    schema.index({
      name: 'text',
    });
    const User = createTestModel(schema);
    await Promise.all([User.create({ name: 'Billy' }), User.create({ name: 'Willy' })]);

    result = await User.search({
      keyword: 'bil',
      sort: {
        field: 'name',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([{ name: 'Billy' }]);
    expect(result.meta.total).toBe(1);

    result = await User.search({
      keyword: 'lly',
      sort: {
        field: 'name',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([{ name: 'Billy' }, { name: 'Willy' }]);
    expect(result.meta.total).toBe(2);
  });

  it('should allow partial text match on multiple fields', async () => {
    let result;
    const schema = createSchema({
      attributes: {
        name: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          required: true,
        },
      },
      search: ['name', 'role'],
    });
    schema.index({
      name: 'text',
    });
    const User = createTestModel(schema);
    await Promise.all([User.create({ name: 'Billy', role: 'user' }), User.create({ name: 'Willy', role: 'manager' })]);

    result = await User.search({ keyword: 'use' });
    expect(result.data).toMatchObject([{ name: 'Billy', role: 'user' }]);
    expect(result.meta.total).toBe(1);

    result = await User.search({ keyword: 'man' });
    expect(result.data).toMatchObject([{ name: 'Willy', role: 'manager' }]);
    expect(result.meta.total).toBe(1);
  });

  it('should allow id search with partial text match', async () => {
    let result;
    const schema = createSchema({
      attributes: {
        name: {
          type: String,
          required: true,
        },
      },
      search: ['name'],
    });
    const User = createTestModel(schema);
    const [billy] = await Promise.all([
      User.create({ name: 'Billy', role: 'user' }),
      User.create({ name: 'Willy', role: 'manager' }),
    ]);

    result = await User.search({ keyword: billy.id });
    expect(result.data).toMatchObject([{ name: 'Billy' }]);
    expect(result.meta.total).toBe(1);
  });

  it('should search on an array field', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
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
    expect(result.data).toMatchObject([{ id: user1.id }]);
    expect(result.meta.total).toBe(1);

    result = await User.search({
      categories: ['owner'],
      sort: {
        field: 'order',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([{ id: user1.id }, { id: user2.id }]);
    expect(result.meta.total).toBe(2);
  });

  it('should allow shorthand for a regex query', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
        name: String,
      })
    );
    await Promise.all([User.create({ name: 'Willy' }), User.create({ name: 'Billy' })]);

    let result;

    result = await User.search({
      name: '/bi/i',
    });
    expect(result.data).toMatchObject([{ name: 'Billy' }]);
    expect(result.meta.total).toBe(1);
  });

  it('should behave like $in when empty array passed', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
        categories: [String],
      })
    );
    await Promise.all([User.create({ categories: ['owner', 'member'] }), User.create({ categories: ['owner'] })]);

    const result = await User.search({
      categories: [],
    });
    expect(result.data).toMatchObject([]);
    expect(result.meta.total).toBe(0);
  });

  it('should be able to perform a search on a nested field', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
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
    expect(result.data).toMatchObject([{ id: user1.id }, { id: user2.id }]);
    expect(result.meta.total).toBe(2);

    result = await User.search({
      roles: {
        role: ['owner', 'member'],
      },
      sort: {
        field: 'order',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([{ id: user1.id }, { id: user2.id }]);
    expect(result.meta.total).toBe(2);

    result = await User.search({
      roles: {
        role: ['owner'],
      },
      sort: {
        field: 'order',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([{ id: user1.id }]);
    expect(result.meta.total).toBe(1);
  });

  it('should be able to perform a search on a complex nested field', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
        name: String,
        profile: {
          roles: [
            {
              role: {
                functions: [String],
              },
            },
          ],
        },
      })
    );
    await Promise.all([
      User.create({
        name: 'Bob',
        profile: {
          roles: [
            {
              role: {
                functions: ['owner', 'spectator'],
              },
            },
          ],
        },
      }),
      User.create({
        name: 'Fred',
        profile: {
          roles: [
            {
              role: {
                functions: ['manager', 'spectator'],
              },
            },
          ],
        },
      }),
    ]);

    let result;
    result = await User.search({
      profile: {
        roles: {
          role: {
            functions: ['owner'],
          },
        },
      },
    });
    expect(result.data).toMatchObject([
      {
        name: 'Bob',
      },
    ]);
  });

  it('should be able to mixin operator queries', async () => {
    let result;

    const User = createTestModel(
      createSchemaFromAttributes({
        name: {
          type: String,
        },
        age: {
          type: Number,
        },
      })
    );
    await Promise.all([
      User.create({ name: 'Billy', age: 20 }),
      User.create({ name: 'Willy', age: 32 }),
      User.create({ name: 'Chilly', age: 10 }),
    ]);

    result = await User.search({
      $or: [{ name: 'Billy' }, { age: 10 }],
      sort: {
        field: 'name',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([
      { name: 'Billy', age: 20 },
      { name: 'Chilly', age: 10 },
    ]);

    result = await User.search({
      name: { $ne: 'Billy' },
      sort: {
        field: 'name',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([
      { name: 'Chilly', age: 10 },
      { name: 'Willy', age: 32 },
    ]);
  });

  it('should be able to mixin nested operator queries', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
        name: {
          type: String,
        },
      })
    );
    await Promise.all([User.create({ name: 'Billy' }), User.create({ name: 'Willy' })]);
    const { data, meta } = await User.search({ name: { $ne: 'Billy' } });
    expect(data).toMatchObject([
      {
        name: 'Willy',
      },
    ]);
    expect(meta).toEqual({
      total: 1,
      limit: 50,
      skip: 0,
    });
  });

  it('should allow custom dot path in query', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
        roles: [
          {
            role: {
              type: 'String',
              required: true,
            },
            scope: {
              type: 'String',
              required: true,
            },
            scopeRef: {
              type: 'ObjectId',
              ref: 'Organization',
            },
          },
        ],
      })
    );
    const ref1 = mongoose.Types.ObjectId();
    const ref2 = mongoose.Types.ObjectId();

    await User.create(
      {
        roles: [
          {
            role: 'admin',
            scope: 'organization',
            scopeRef: ref1,
          },
        ],
      },
      {
        roles: [
          {
            role: 'admin',
            scope: 'organization',
            scopeRef: ref2,
          },
        ],
      }
    );
    const { data } = await User.search({
      'roles.scope': 'organization',
      'roles.scopeRef': ref1,
    });

    expect(data.length).toBe(1);
  });

  it('should allow date range search', async () => {
    let result;
    const schema = createSchemaFromAttributes({
      name: String,
      archivedAt: {
        type: Date,
      },
    });
    const User = createTestModel(schema);
    await Promise.all([
      User.create({ name: 'Billy', archivedAt: '2020-01-01' }),
      User.create({ name: 'Willy', archivedAt: '2021-01-01' }),
    ]);

    result = await User.search({ archivedAt: { lte: '2020-06-01' } });
    expect(result.data).toMatchObject([{ name: 'Billy' }]);
    expect(result.meta.total).toBe(1);

    result = await User.search({ archivedAt: { gte: '2020-06-01' } });
    expect(result.data).toMatchObject([{ name: 'Willy' }]);
    expect(result.meta.total).toBe(1);

    result = await User.search({
      archivedAt: { gte: '2019-06-01' },
      sort: {
        field: 'name',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([{ name: 'Billy' }, { name: 'Willy' }]);
    expect(result.meta.total).toBe(2);

    result = await User.search({
      archivedAt: {},
      sort: {
        field: 'name',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([{ name: 'Billy' }, { name: 'Willy' }]);
    expect(result.meta.total).toBe(2);
  });

  it('should allow number range search', async () => {
    let result;
    const schema = createSchemaFromAttributes({
      name: String,
      age: Number,
    });
    const User = createTestModel(schema);
    await Promise.all([User.create({ name: 'Billy', age: 22 }), User.create({ name: 'Willy', age: 54 })]);

    result = await User.search({ age: { lte: 25 } });
    expect(result.data).toMatchObject([{ name: 'Billy' }]);
    expect(result.meta.total).toBe(1);

    result = await User.search({ age: { gte: 25 } });
    expect(result.data).toMatchObject([{ name: 'Willy' }]);
    expect(result.meta.total).toBe(1);

    result = await User.search({
      age: { gte: 10 },
      sort: {
        field: 'name',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([{ name: 'Billy' }, { name: 'Willy' }]);
    expect(result.meta.total).toBe(2);

    result = await User.search({
      age: {},
      sort: {
        field: 'name',
        order: 'asc',
      },
    });
    expect(result.data).toMatchObject([{ name: 'Billy' }, { name: 'Willy' }]);
    expect(result.meta.total).toBe(2);
  });

  it('should return the query to allow population', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
        name: 'String',
      })
    );
    const Shop = createTestModel(
      createSchemaFromAttributes({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
        },
      })
    );

    const user = await User.create({ name: 'Billy' });
    await Shop.create({
      user: user.id,
    });

    const { data, meta } = await Shop.search().populate('user');

    expect(data).toMatchObject([{ user: { name: 'Billy' } }]);
    expect(meta).toEqual({
      total: 1,
      limit: 50,
      skip: 0,
    });
  });

  it('should error on bad queries', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
        name: 'String',
      })
    );
    await expect(async () => {
      await User.search({ _id: 'bad' });
    }).rejects.toThrow();
  });
});

describe('assertNoReferences', () => {
  it('should throw error if document is referenced externally', async () => {
    const User = createTestModel(
      createSchemaFromAttributes({
        name: {
          type: String,
          required: true,
        },
      })
    );
    const Shop = createTestModel(
      createSchemaFromAttributes({
        user: {
          ref: User.modelName,
          type: mongoose.Schema.Types.ObjectId,
        },
      })
    );
    const user1 = await User.create({ name: 'foo ' });
    const user2 = await User.create({ name: 'foo ' });
    await Shop.create({ user: user1 });

    await expect(async () => {
      await user1.assertNoReferences();
    }).rejects.toThrow();

    await expect(user2.assertNoReferences()).resolves.toBeUndefined();
  });
});

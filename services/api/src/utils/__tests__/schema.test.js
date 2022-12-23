const mongoose = require('mongoose');
const yd = require('@bedrockio/yada');
const { createSchema, loadModel, loadModelDir } = require('../schema');
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

    it('should error when type is unknown', async () => {
      expect(() => {
        createSchemaFromAttributes({
          image: {
            type: 'Object',
            ref: 'Upload',
          },
        });
      }).toThrow();
    });

    it('should not error when ObjectId has a refPath', async () => {
      const schema = createSchemaFromAttributes({
        image: {
          type: 'ObjectId',
          refPath: 'fakePath',
        },
      });
      expect(schema.obj.image.type).toBe(mongoose.Schema.Types.ObjectId);
    });

    it('should not error when a ref field is defined', async () => {
      const schema = createSchemaFromAttributes({
        name: 'String',
        ref: 'String',
      });
      expect(schema.obj.ref).toBe(mongoose.Schema.Types.String);
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
        const data = JSON.parse(JSON.stringify(user));
        expect(data.names[0]).toEqual({
          name: 'Foo',
          position: 2,
          id: user.names[0].id,
        });
      });

      it('should not expose _id in deeply nested array objects of mixed type', () => {
        const User = createTestModel(
          createSchemaFromAttributes({
            one: [
              {
                two: [
                  {
                    three: [
                      {
                        name: String,
                        position: Number,
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
                      name: 'Foo',
                      position: 2,
                    },
                  ],
                },
              ],
            },
          ],
        });
        const data = JSON.parse(JSON.stringify(user));
        expect(data).toEqual({
          id: user.id,
          one: [
            {
              id: user.one[0].id,
              two: [
                {
                  id: user.one[0].two[0].id,
                  three: [
                    {
                      name: 'Foo',
                      position: 2,
                      id: user.one[0].two[0].three[0].id,
                    },
                  ],
                },
              ],
            },
          ],
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

        const data = JSON.parse(JSON.stringify(user));
        expect(data).toEqual({
          id: user.id,
          one: [
            {
              id: user.one[0].id,
              two: [
                {
                  id: user.one[0].two[0].id,
                  three: [
                    {
                      id: user.one[0].two[0].three[0].id,
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
              readScopes: { type: String, default: 'none' },
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
        expect(user.terms).toEqual({ service: true, privacy: true, readScopes: 'none' });
        expect(user.toObject().terms).toBeUndefined();
      });
    });

    it('should serialize nested array object ids', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          foo: [
            {
              bar: [
                {
                  name: String,
                },
              ],
            },
          ],
        })
      );
      const user = new User({
        foo: [
          {
            bar: [
              {
                name: 'wut',
              },
            ],
          },
        ],
      });
      const data = JSON.parse(JSON.stringify(user));
      expect(data.foo[0].bar[0].id).not.toBeUndefined();
    });

    it('should serialize id on nested field with type', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          foo: {
            type: {
              type: String,
              required: true,
            },
            bar: [
              {
                name: String,
              },
            ],
          },
        })
      );
      const user = new User({
        foo: {
          type: 'foo type',
          bar: [
            {
              name: 'name',
            },
          ],
        },
      });
      const data = JSON.parse(JSON.stringify(user));
      expect(data.foo.bar[0].id).not.toBeUndefined();
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

    it('should delete null values for reference fields', async () => {
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
        user: null,
        nested: {
          user: null,
        },
      });
      await shop.save();

      data = JSON.parse(JSON.stringify(shop));
      expect(data.user).toBeUndefined();
      expect(data.nested).toEqual({
        name: 'fake',
      });
    });

    it('should not unset non-null falsy values', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          bool: Boolean,
          str: String,
          num: Number,
        })
      );
      const user = await User.create({
        bool: true,
        str: 'str',
        num: 1,
      });
      await user.save();

      let data = JSON.parse(JSON.stringify(user));
      expect(data).toMatchObject({
        bool: true,
        str: 'str',
        num: 1,
      });
      user.assign({
        bool: false,
        str: '',
        num: 0,
      });
      await user.save();

      data = JSON.parse(JSON.stringify(user));
      expect(data).toMatchObject({
        bool: false,
        str: '',
        num: 0,
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

    it('should naively merge nested array fields', async () => {
      const Shop = createTestModel(
        createSchemaFromAttributes({
          products: [
            {
              name: String,
            },
          ],
        })
      );
      const shop = await Shop.create({
        products: [
          {
            name: 'shampoo',
          },
        ],
      });

      shop.assign({
        products: [
          {
            name: 'conditioner',
          },
          {
            name: 'body wash',
          },
        ],
      });
      await shop.save();

      expect(shop.products[0].name).toBe('conditioner');
      expect(shop.products[1].name).toBe('body wash');
    });

    it('should not overwrite mixed content fields', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          profile: 'Object',
        })
      );

      const user = await User.create({
        profile: {
          foo: 'foo',
        },
      });

      user.assign({
        profile: {
          bar: 'bar',
        },
      });
      await user.save();

      expect(user.profile).toEqual({
        foo: 'foo',
        bar: 'bar',
      });
    });

    it('should delete mixed content fields with null', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          profile: 'Object',
        })
      );

      let user = await User.create({
        profile: {
          name: 'Bob',
          age: 30,
        },
      });

      user.assign({
        profile: {
          age: null,
        },
      });
      await user.save();

      user = await User.findById(user.id);

      expect(user.profile.name).toBe('Bob');
      expect('age' in user.profile).toBe(false);
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
    it('should validate an email field', async () => {
      let user;
      const User = createTestModel(
        createSchemaFromAttributes({
          email: {
            type: String,
            validate: 'email',
          },
        })
      );

      await expect(async () => {
        user = new User();
        await user.validate();
      }).not.toThrow();

      await expect(async () => {
        user = new User({
          email: 'good@email.com',
        });
        await user.validate();
      }).not.toThrow();

      await expect(async () => {
        // Note that null is expected to error here as it
        // will fail the type validation. To allow "null"
        // to be a JSON readable signal to unset a field
        // in mongoose it must be converted to "undefined".
        // This is part of why the "assign" method exists.
        user = new User({
          email: null,
        });
        await user.validate();
      }).rejects.toThrow(mongoose.Error.ValidationError);

      await expect(async () => {
        user = new User({
          email: 'bad@email',
        });
        await user.validate();
      }).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should validate a required email field', async () => {
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

      await expect(async () => {
        user = new User({
          email: 'good@email.com',
        });
        await user.validate();
      }).not.toThrow();

      await expect(async () => {
        user = new User({
          email: 'bad@email',
        });
        await user.validate();
      }).rejects.toThrow();

      await expect(async () => {
        user = new User({
          email: '',
        });
        await user.validate();
      }).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should validate a nested email field', async () => {
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

      await expect(async () => {
        user = new User({
          emails: ['good@email.com'],
        });
        await user.validate();
      }).not.toThrow();

      await expect(async () => {
        user = new User({
          emails: ['bad@email'],
        });
        await user.validate();
      }).rejects.toThrow(mongoose.Error.ValidationError);
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
      expect(await User.exists()).toBe(null);
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
      expect(await User.existsDeleted()).toStrictEqual({ _id: deletedUser._id });
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
        name: 'bars',
        deletedAt: new Date(),
        deleted: true,
      });
      expect((await User.findWithDeleted()).length).toBe(2);
      expect(await User.findOneWithDeleted({ name: 'bars' })).not.toBe(null);
      expect(await User.findByIdWithDeleted(deletedUser.id)).not.toBe(null);
      expect(await User.existsWithDeleted({ name: 'bars' })).not.toBe(null);
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
  async function assertPass(schema, obj, options) {
    await expect(schema.validate(obj, options)).resolves.not.toThrow();
  }

  async function assertFail(schema, obj, options) {
    await expect(schema.validate(obj, options)).rejects.toThrow();
  }

  describe('getCreateValidation', () => {
    it('should get a basic create schema', async () => {
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
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
        name: 'foo',
        count: 10,
      });
      await assertFail(schema, {
        name: 'foo',
      });
      await assertFail(schema, {
        name: 10,
        count: 10,
      });
      await assertFail(schema, {
        foo: 'bar',
      });
    });

    it('should be able to append schemas', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getCreateValidation({
        count: yd.number().required(),
      });
      expect(yd.isSchema(schema)).toBe(true);
      await assertFail(schema, {
        name: 'foo',
      });
      await assertPass(schema, {
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
      await assertPass(schema, {
        geoLocation: {
          type: 'Line',
          coordinates: [35, 95],
        },
      });
      await assertFail(schema, {
        geoLocation: 'Line',
      });
    });

    it('should not require a field with a default', async () => {
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
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
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
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
        name: 'foo',
      });
    });
  });

  describe('getUpdateValidation', () => {
    it('should not fail on empty object', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: {
            type: String,
          },
        })
      );
      const schema = User.getUpdateValidation();
      await assertPass(schema, {});
    });

    it('should skip unknown in nested validations', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          names: [
            {
              first: String,
            },
          ],
        })
      );
      const schema = User.getUpdateValidation();
      await assertPass(schema, {
        names: [
          {
            id: 'fake id',
            first: 'First',
          },
        ],
      });
    });

    it('should skip required fields', async () => {
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
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
        name: 'foo',
      });
      await assertPass(schema, {
        count: 10,
      });
    });

    it('should not enforce a schema on unstructured objects', async () => {
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
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
        devices: [
          {
            id: 'id',
            name: 'name',
            class: 'class',
          },
        ],
      });
      await assertPass(schema, {
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

      const result = await schema.validate({
        profile: {
          name: 'name',
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
      expect(result).toEqual({
        profile: {
          name: 'name',
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

    it('should strip reserved fields', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getUpdateValidation();
      await assertPass(schema, {
        name: 'foo',
        id: 'id',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        deletedAt: 'deletedAt',
      });
    });

    it('should strip virtuals', async () => {
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
      await assertPass(schema, data);
      expect(await schema.validate(data)).toEqual({
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should strip nested virtuals', async () => {
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
      await assertPass(schema, data);
      expect(await schema.validate(data)).toEqual({
        profile: {
          firstName: 'John',
          lastName: 'Doe',
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
        await assertPass(schema, {
          name: 'Barry',
        });
        await assertFail(schema, {
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
        await assertPass(schema, {
          name: 'Barry',
        });

        const value = await schema.validate({
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
        await assertPass(schema, {
          name: 'Barry',
        });
        await assertFail(schema, {
          name: 'Barry',
          password: 'fake password',
        });
        await assertPass(
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
        await assertPass(
          schema,
          {
            foo: 'foo!',
          },
          { scopes: ['foo'] }
        );
        await assertFail(
          schema,
          {
            bar: 'bar!',
          },
          { scopes: ['foo'] }
        );
        await assertPass(
          schema,
          {
            foobar: 'foobar!',
          },
          { scopes: ['foo'] }
        );
        await assertPass(
          schema,
          {
            foo: 'foo!',
            foobar: 'foobar!',
          },
          { scopes: ['foo'] }
        );
        await assertFail(
          schema,
          {
            foo: 'foo!',
            bar: 'bar!',
            foobar: 'foobar!',
          },
          { scopes: ['foo'] }
        );

        // With ['bar'] scopes
        await assertFail(
          schema,
          {
            foo: 'foo!',
          },
          { scopes: ['bar'] }
        );
        await assertPass(
          schema,
          {
            bar: 'bar!',
          },
          { scopes: ['bar'] }
        );
        await assertPass(
          schema,
          {
            foobar: 'foobar!',
          },
          { scopes: ['bar'] }
        );
        await assertFail(
          schema,
          {
            foo: 'foo!',
            foobar: 'foobar!',
          },
          { scopes: ['bar'] }
        );
        await assertFail(
          schema,
          {
            foo: 'foo!',
            bar: 'bar!',
            foobar: 'foobar!',
          },
          { scopes: ['bar'] }
        );

        // With ['foo', 'bar'] scopes
        await assertPass(
          schema,
          {
            foo: 'foo!',
          },
          { scopes: ['foo', 'bar'] }
        );
        await assertPass(
          schema,
          {
            bar: 'bar!',
          },
          { scopes: ['foo', 'bar'] }
        );
        await assertPass(
          schema,
          {
            foobar: 'foobar!',
          },
          { scopes: ['foo', 'bar'] }
        );
        await assertPass(
          schema,
          {
            foo: 'foo!',
            foobar: 'foobar!',
          },
          { scopes: ['foo', 'bar'] }
        );
        await assertPass(
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

    it('should allow search on a nested field', async () => {
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
      await assertPass(schema, {
        roles: {
          role: 'test',
        },
      });
    });

    it('should strip validation with skip flag', async () => {
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
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
        name: 'foo',
        age: 25,
      });
      const value = await schema.validate({
        name: 'foo',
        age: 25,
      });
      expect(value.age).toBeUndefined();
    });

    it('should not skip required validations in array fields', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          users: [
            {
              name: {
                type: String,
                required: true,
              },
              count: {
                type: Number,
              },
            },
          ],
        })
      );
      const schema = User.getUpdateValidation();
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
        users: [
          {
            name: 'foo',
          },
        ],
      });
      await assertPass(schema, {
        users: [
          {
            name: 'foo',
            count: 1,
          },
        ],
      });
      await assertFail(schema, {
        users: [{}],
      });
      await assertFail(schema, {
        users: [
          {
            count: 1,
          },
        ],
      });
    });
  });

  describe('getSearchValidation', () => {
    it('should get a basic search schema allowing empty', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getSearchValidation();
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
        name: 'foo',
      });
      await assertPass(schema, {});
    });

    it('should mixin default search schema', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getSearchValidation();
      await assertPass(schema, {
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

    it('should allow an array for a string field', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          name: {
            type: String,
            required: true,
          },
        })
      );
      const schema = User.getSearchValidation();
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
        name: ['foo', 'bar'],
      });
      await assertPass(schema, {});
    });

    it('should allow range based search', async () => {
      const User = createTestModel(
        createSchemaFromAttributes({
          age: Number,
          date: Date,
        })
      );
      const schema = User.getSearchValidation();
      expect(yd.isSchema(schema)).toBe(true);
      await assertPass(schema, {
        age: { gte: 5 },
      });
      await assertPass(schema, {
        date: { gte: '2020-01-01' },
      });
      await assertPass(schema, {});
    });
  });

  it('should allow min/max on fields', async () => {
    const Review = createTestModel(
      createSchemaFromAttributes({
        age: {
          type: Number,
          min: 0,
          max: 100,
        },
        date: {
          type: Date,
          min: '2020-01-01',
          max: '2021-01-01',
        },
      })
    );
    const schema = Review.getSearchValidation();
    await assertPass(schema, {
      age: 50,
    });
    await assertFail(schema, {
      age: -50,
    });
    await assertFail(schema, {
      age: 150,
    });
    await assertPass(schema, {
      date: '2020-06-01',
    });
    await assertFail(schema, {
      date: '2019-01-01',
    });
    await assertFail(schema, {
      date: '2022-01-01',
    });
    await assertPass(schema, {});
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
    await User.createIndexes();
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

  it('should allow date range search on dot path', async () => {
    let result;
    const schema = createSchemaFromAttributes({
      user: {
        name: String,
        archivedAt: {
          type: Date,
        },
      },
    });
    const User = createTestModel(schema);
    await Promise.all([
      User.create({ user: { name: 'Billy', archivedAt: '2020-01-01' } }),
      User.create({ user: { name: 'Willy', archivedAt: '2021-01-01' } }),
    ]);

    result = await User.search({ 'user.archivedAt': { lte: '2020-06-01' } });
    expect(result.data).toMatchObject([{ user: { name: 'Billy' } }]);
    expect(result.meta.total).toBe(1);
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

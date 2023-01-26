const { getValidationSchema, getMongooseValidator } = require('../validation');
const yd = require('@bedrockio/yada');

async function assertPass(schema, obj, expected) {
  try {
    const result = await schema.validate(obj);
    if (expected) {
      expect(result).toEqual(expected);
    } else {
      expect(true).toBe(true);
    }
  } catch (error) {
    // eslint-disable-next-line
    console.error(error);
    throw error;
  }
}

async function assertFail(schema, obj) {
  try {
    await schema.validate(obj);
    throw new Error('Expected failure but passed.');
  } catch (error) {
    if (!error.details) {
      throw error;
    }
    expect(error).not.toBeUndefined();
  }
}

describe('getValidationSchema', () => {
  describe('alternate type forms', () => {
    it('should get a schema for a basic string field', async () => {
      const schema = getValidationSchema({
        name: { type: String },
      });
      expect(yd.isSchema(schema)).toBe(true);
    });

    it('should get a schema for shorthand string field', async () => {
      const schema = getValidationSchema({
        name: String,
      });
      expect(yd.isSchema(schema)).toBe(true);
    });

    it('should get a schema for string type', async () => {
      const schema = getValidationSchema({
        name: { type: 'String' },
      });
      expect(yd.isSchema(schema)).toBe(true);
    });

    it('should get a schema for shorthand string type', async () => {
      const schema = getValidationSchema({
        name: 'String',
      });
      expect(yd.isSchema(schema)).toBe(true);
    });
  });

  describe('basic functionality', () => {
    it('should validate basic fields', async () => {
      const schema = getValidationSchema({
        name: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
        },
      });
      await assertPass(schema, {
        name: 'foo',
      });
      await assertPass(schema, {
        name: 'foo',
        count: 10,
      });
      await assertFail(schema, {
        count: 10,
      });
      await assertFail(schema, {});
    });

    it('should strip unknown fields', async () => {
      const schema = getValidationSchema(
        {
          name: String,
        },
        {
          stripUnknown: true,
        }
      );
      await assertPass(schema, { id: 1, name: 'foo' }, { name: 'foo' });
      await assertPass(schema, { createdAt: 'date', name: 'foo' });
      await assertPass(schema, { updatedAt: 'date', name: 'foo' });
      await assertPass(schema, { deletedAt: 'date', name: 'foo' });
    });

    it('should be able to override required fields', async () => {
      const schema = getValidationSchema(
        {
          name: {
            type: String,
            required: true,
          },
          count: {
            type: Number,
            required: true,
          },
        },
        {
          skipRequired: true,
        }
      );
      await assertPass(schema, { name: 'foo' });
      await assertPass(schema, { count: 5 });
      await assertPass(schema, {});
    });

    it('should not skip required inside nested arrays', async () => {
      const schema = getValidationSchema(
        {
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
        },
        {
          skipRequired: true,
        }
      );
      await assertPass(schema, {
        users: [
          {
            name: 'foo',
            count: 1,
          },
        ],
      });
      await assertPass(schema, {
        users: [
          {
            name: 'foo',
          },
        ],
      });
      await assertPass(schema, {
        users: [],
      });
      await assertFail(schema, {
        users: [{}],
      });
    });

    it('should be able to transform fields', async () => {
      const schema = getValidationSchema(
        {
          name: {
            type: String,
            required: true,
          },
        },
        {
          transformField: (key, field) => {
            if (key === 'name') {
              return {
                ...field,
                minLength: 5,
              };
            }
          },
        }
      );
      await assertFail(schema, { name: 'foo' });
      await assertPass(schema, { name: 'fooooo' });
    });

    it('should be able to disallow fields with custom transform', async () => {
      const schema = getValidationSchema(
        {
          name: {
            type: String,
            required: true,
          },
          password: {
            type: String,
            private: true,
          },
        },
        {
          transformField: (key, field) => {
            if (!field.private) {
              return field;
            }
          },
        }
      );
      await assertPass(schema, { name: 'foo' });
      await assertFail(schema, { name: 'foo', password: 'bar' });
    });

    it('should be able return a schema in transform', async () => {
      const schema = getValidationSchema(
        {
          name: {
            type: String,
            required: true,
          },
        },
        {
          transformField: () => {
            return yd.string().min(5);
          },
        }
      );
      await assertFail(schema, { name: 'foo' });
      await assertPass(schema, { name: 'foooo' });
    });
  });

  describe('global options', () => {
    it('should validate a required field', async () => {
      const schema = getValidationSchema({
        name: {
          type: String,
          required: true,
        },
      });
      await assertPass(schema, { name: 'foo' });
      await assertFail(schema, {});
    });
  });

  describe('string fields', () => {
    it('should validate an enum field', async () => {
      const schema = getValidationSchema({
        name: {
          type: String,
          enum: ['foo', 'bar'],
        },
      });
      await assertPass(schema, { name: 'foo' });
      await assertPass(schema, { name: 'bar' });
      await assertFail(schema, { name: 'baz' });
    });

    it('should optionally allow an array on an enum field', async () => {
      const schema = getValidationSchema(
        {
          name: {
            type: String,
            enum: ['foo', 'bar'],
          },
        },
        {
          allowMultiple: true,
        }
      );
      await assertPass(schema, { name: ['foo', 'bar'] });
    });

    it('should validate minimum length', async () => {
      const schema = getValidationSchema({
        name: {
          type: String,
          minLength: 3,
        },
      });
      await assertPass(schema, { name: 'foo' });
      await assertFail(schema, { name: 'fo' });
    });

    it('should validate maximum length', async () => {
      const schema = getValidationSchema({
        name: {
          type: String,
          maxLength: 3,
        },
      });
      await assertPass(schema, { name: 'foo' });
      await assertFail(schema, { name: 'fooo' });
    });

    it('should validate minimum and maximum length together', async () => {
      const schema = getValidationSchema({
        name: {
          type: String,
          minLength: 3,
          maxLength: 5,
        },
      });
      await assertPass(schema, { name: 'foo' });
      await assertPass(schema, { name: 'fooo' });
      await assertFail(schema, { name: 'foooooo' });
    });

    it('should validate a matched field', async () => {
      const schema = getValidationSchema({
        name: {
          type: String,
          match: /^foo$/,
        },
      });
      await assertPass(schema, { name: 'foo' });
      await assertFail(schema, { name: 'foo ' });
    });

    it('should convert string match field to regex', async () => {
      const schema = getValidationSchema({
        name: {
          type: 'String',
          match: '^foo$',
        },
      });
      await assertPass(schema, { name: 'foo' });
      await assertFail(schema, { name: 'bar' });
    });
  });

  describe('number fields', () => {
    it('should validate an enum field', async () => {
      const schema = getValidationSchema({
        count: {
          type: Number,
          enum: [100, 1000],
        },
      });
      await assertPass(schema, { count: 100 });
      await assertPass(schema, { count: 1000 });
      await assertFail(schema, { count: 1001 });
    });

    it('should validate a minimum value', async () => {
      const schema = getValidationSchema({
        count: {
          type: Number,
          min: 100,
        },
      });
      await assertPass(schema, { count: 100 });
      await assertFail(schema, { count: 99 });
    });

    it('should validate maximum value', async () => {
      const schema = getValidationSchema({
        count: {
          type: Number,
          max: 100,
        },
      });
      await assertPass(schema, { count: 100 });
      await assertFail(schema, { count: 101 });
    });

    it('should validate minimum and maximum together', async () => {
      const schema = getValidationSchema({
        count: {
          type: Number,
          min: 100,
          max: 200,
        },
      });
      await assertPass(schema, { count: 100 });
      await assertPass(schema, { count: 200 });
      await assertFail(schema, { count: 99 });
      await assertFail(schema, { count: 201 });
    });
  });

  describe('boolean fields', () => {
    it('should validate boolean field', async () => {
      const schema = getValidationSchema({
        isActive: Boolean,
      });
      await assertPass(schema, { isActive: true });
      await assertPass(schema, { isActive: false });
    });
  });

  describe('date fields', () => {
    it('should validate date ISO-8601 field', async () => {
      const schema = getValidationSchema({
        posted: Date,
      });
      await assertPass(schema, { posted: '2020-01-01T00:00:00Z' });
      await assertPass(schema, { posted: '2020-01-01T00:00:00' });
      await assertFail(schema, { posted: 'January 1, 2020' });
    });
  });

  describe('reference fields', () => {
    describe('simple', () => {
      it('should validate a string reference field', async () => {
        const schema = getValidationSchema({
          image: {
            type: 'ObjectId',
            ref: 'Upload',
          },
        });
        await assertPass(schema, { image: '5fd396fac80fa73203bd9554' });
        await assertFail(schema, { image: 'bad id' });
      });

      it('should transform an object with a valid id', async () => {
        const schema = getValidationSchema({
          image: {
            type: 'ObjectId',
            ref: 'Upload',
          },
        });
        await assertPass(schema, { image: '5fd396fac80fa73203bd9554' });
        await assertPass(schema, { image: { id: '5fd396fac80fa73203bd9554' } });
        await assertFail(schema, { image: { id: '5fd396fac80fa73203bd9xyz' } });
        await assertFail(schema, { image: { id: '5fd396fac80f' } });
        await assertFail(schema, { image: { id: 'bad id' } });
        await assertFail(schema, { image: { id: '' } });
      });

      it('should transform an array of objects or ids', async () => {
        const schema = getValidationSchema({
          categories: [
            {
              type: 'ObjectId',
              ref: 'Upload',
            },
          ],
        });
        await assertPass(schema, { categories: ['5fd396fac80fa73203bd9554'] });
        await assertPass(schema, { categories: [{ id: '5fd396fac80fa73203bd9554' }] });
        await assertPass(schema, {
          categories: [
            '5fd396fac80fa73203bd9554',
            { id: '5fd396fac80fa73203bd9554' },
            '5fd396fac80fa73203bd9554',
            { id: '5fd396fac80fa73203bd9554' },
            '5fd396fac80fa73203bd9554',
          ],
        });
        await assertFail(schema, {
          categories: [{ id: '5fd396fac80fa73203bd9554' }, 'bad id'],
        });
        await assertFail(schema, { categories: [{ id: '5fd396fac80fa73203bd9xyz' }] });
        await assertFail(schema, { categories: [{ id: '5fd396fac80f' }] });
        await assertFail(schema, { categories: [{ id: 'bad id' }] });
        await assertFail(schema, { categories: [{ id: '' }] });
      });
    });

    describe('nested', () => {
      it('should transform a deeply nested ObjectId', async () => {
        const schema = getValidationSchema({
          user: {
            manager: {
              category: {
                type: 'ObjectId',
                ref: 'Upload',
              },
            },
          },
        });
        await assertPass(schema, {
          user: {
            manager: {
              category: '5fd396fac80fa73203bd9554',
            },
          },
        });
        await assertPass(schema, {
          user: {
            manager: {
              category: {
                id: '5fd396fac80fa73203bd9554',
              },
            },
          },
        });
        await assertFail(schema, {
          user: {
            manager: {
              category: {
                id: {
                  id: '5fd396fac80fa73203bd9554',
                },
              },
            },
          },
        });
        await assertFail(schema, {
          user: {
            manager: {
              id: '5fd396fac80fa73203bd9554',
            },
          },
        });
        await assertFail(schema, {
          user: {
            id: '5fd396fac80fa73203bd9554',
          },
        });
        await assertFail(schema, {
          id: '5fd396fac80fa73203bd9554',
        });
        await assertPass(schema, {});
      });

      it('should transform a deeply nested array ObjectId', async () => {
        const schema = getValidationSchema({
          users: [
            {
              managers: [
                {
                  categories: [
                    {
                      type: 'ObjectId',
                      ref: 'Upload',
                    },
                  ],
                },
              ],
            },
          ],
        });
        await assertPass(schema, {
          users: [
            {
              managers: [
                {
                  categories: ['5fd396fac80fa73203bd9554'],
                },
              ],
            },
          ],
        });
        await assertPass(schema, {
          users: [
            {
              managers: [
                {
                  categories: [
                    {
                      id: '5fd396fac80fa73203bd9554',
                    },
                  ],
                },
              ],
            },
          ],
        });
        await assertFail(schema, {
          users: [
            {
              manager: [
                {
                  categories: [
                    {
                      id: {
                        id: '5fd396fac80fa73203bd9554',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        });
        await assertFail(schema, {
          users: [
            {
              managers: [
                {
                  id: '5fd396fac80fa73203bd9554',
                },
              ],
            },
          ],
        });
        await assertFail(schema, {
          users: [
            {
              id: '5fd396fac80fa73203bd9554',
            },
          ],
        });
        await assertFail(schema, {
          id: '5fd396fac80fa73203bd9554',
        });
        await assertPass(schema, {});
      });
    });
  });

  describe('array fields', () => {
    it('should validate array of strings', async () => {
      const schema = getValidationSchema({
        categories: [
          {
            type: String,
          },
        ],
      });
      await assertPass(schema, { categories: ['foo'] });
      await assertPass(schema, { categories: [] });
      await assertFail(schema, { categories: 'foo' });
    });

    it('should validate array type shortcut syntax', async () => {
      const schema = getValidationSchema({
        categories: [String],
      });
      await assertPass(schema, { categories: ['foo'] });
      await assertPass(schema, { categories: [] });
      await assertFail(schema, { categories: 'foo' });
    });

    it('should validate array of object ids', async () => {
      const schema = getValidationSchema({
        categories: [
          {
            type: 'ObjectId',
          },
        ],
      });
      await assertPass(schema, { categories: ['5fd396fac80fa73203bd9554'] });
      await assertPass(schema, { categories: [] });
      await assertFail(schema, { categories: ['bad id'] });
    });

    it('should validate minimum number of elements for required array field', async () => {
      const schema = getValidationSchema({
        categories: [
          {
            type: String,
            required: true,
          },
        ],
      });
      await assertPass(schema, { categories: ['foo'] });
      await assertFail(schema, { categories: [] });
      await assertFail(schema, { categories: 'foo' });
    });

    it('should validate nested object array', async () => {
      const schema = getValidationSchema({
        roles: [
          {
            role: { type: 'String', required: true },
            scope: { type: 'String', required: true },
            scopeRef: { type: 'ObjectId' },
          },
        ],
      });
      await assertPass(schema, {
        roles: [
          {
            role: 'role',
            scope: 'scope',
          },
        ],
      });
      await assertPass(schema, {
        roles: [
          {
            role: 'role1',
            scope: 'scope',
          },
          {
            role: 'role2',
            scope: 'scope',
          },
        ],
      });
      await assertPass(schema, {
        roles: [
          {
            role: 'role',
            scope: 'scope',
            scopeRef: '60096760d392ed3ba949265d',
          },
        ],
      });
      await assertFail(schema, {
        roles: [
          {
            role: 'role',
          },
        ],
      });
      await assertFail(schema, {
        roles: [
          {
            scope: 'scope',
          },
        ],
      });
    });

    it('should allow explit array string type', async () => {
      const schema = getValidationSchema({
        tags: 'Array',
      });
      await assertPass(schema, {
        tags: ['foo', 'bar'],
      });
      await assertFail(schema, {
        tags: 'foo',
      });
    });

    it('should allow explit array function type', async () => {
      const schema = getValidationSchema({
        tags: Array,
      });
      await assertPass(schema, {
        tags: ['foo', 'bar'],
      });
      await assertFail(schema, {
        tags: 'foo',
      });
    });
  });

  describe('nested fields', () => {
    it('should validate nested field', async () => {
      const schema = getValidationSchema({
        counts: {
          view: Number,
        },
      });
      await assertPass(schema, { counts: { view: 1 } });
      await assertFail(schema, { counts: { view: 'bad number' } });
    });

    it('should not validate mixed type', async () => {
      const schema = getValidationSchema({
        counts: 'Mixed',
      });
      await assertPass(schema, { counts: { foo: 'bar' } });
      await assertPass(schema, { counts: { name: 'foo' } });
    });

    it('should not validate explicit mixed type', async () => {
      const schema = getValidationSchema({
        counts: {
          type: 'Mixed',
        },
      });
      await assertPass(schema, { counts: { foo: 'bar' } });
      await assertPass(schema, { counts: { name: 'foo' } });
    });

    it('should validate mixed with nested type object', async () => {
      const schema = getValidationSchema({
        type: { type: String, required: true },
      });
      await assertPass(schema, { type: 'foo' });
      await assertFail(schema, { type: { type: 'foo' } });
      await assertFail(schema, {});
    });
  });

  describe('appendSchema', () => {
    it('should be able to append plain objects as schemas', async () => {
      const schema = getValidationSchema(
        {
          type: { type: String, required: true },
        },
        {
          appendSchema: {
            count: yd.number().required(),
          },
        }
      );
      await assertFail(schema, { type: 'foo' });
      await assertPass(schema, { type: 'foo', count: 10 });
    });

    it('should be able to merge schemas', async () => {
      const schema = getValidationSchema(
        {
          type: { type: String, required: true },
          count: { type: Number, required: true },
        },
        {
          appendSchema: yd.object({
            count: yd.number(),
          }),
        }
      );
      await assertPass(schema, { type: 'foo' });
      await assertPass(schema, { type: 'foo', count: 10 });
    });
  });

  describe('ranges', () => {
    it('should be able to append a date range schema', async () => {
      const schema = getValidationSchema(
        {
          startsAt: { type: Date },
        },
        {
          allowRanges: true,
        }
      );
      await assertPass(schema, { startsAt: '2020-01-01' });
      await assertPass(schema, { startsAt: { lte: '2020-01-01' } });
      await assertPass(schema, { startsAt: { gte: '2019-01-01' } });
      await assertPass(schema, { startsAt: { gte: '2019-01-01', lte: '2020-01-01' } });
      await assertPass(schema, { startsAt: { lt: '2020-01-01' } });
      await assertPass(schema, { startsAt: { gt: '2019-01-01' } });
      await assertPass(schema, { startsAt: { gt: '2019-01-01', lt: '2020-01-01' } });
      await assertPass(schema, { startsAt: {} });
      await assertFail(schema, { startsAt: { lte: 'bad' } });
    });

    it('should be able to append a number range schema', async () => {
      const schema = getValidationSchema(
        {
          age: { type: Number },
        },
        {
          allowRanges: true,
        }
      );
      await assertPass(schema, { age: 5 });
      await assertPass(schema, { age: { lte: 5 } });
      await assertPass(schema, { age: { gte: 5 } });
      await assertPass(schema, { age: { gte: 5, lte: 5 } });
      await assertPass(schema, { age: { lt: 5 } });
      await assertPass(schema, { age: { gt: 5 } });
      await assertPass(schema, { age: { gt: 5, lt: 5 } });
      await assertPass(schema, { age: {} });
      await assertFail(schema, { age: { lte: 'bad' } });
    });
  });
});

describe('getMongooseValidator', () => {
  it('should get an email validator', async () => {
    const field = {
      type: 'String',
      validate: 'email',
    };
    const emailValidator = getMongooseValidator(field);
    await expect(emailValidator('foo@bar.com')).resolves.not.toThrow();
    await expect(emailValidator('bad@email')).rejects.toThrow();
  });
});

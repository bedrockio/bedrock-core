const { getJoiSchemaForDefinition, getMongooseValidator } = require('../validation');
const { setupDb, teardownDb } = require('../../utils/testing');
const Joi = require('joi');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

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

describe('getJoiSchemaForDefinition', () => {

  describe('alternate type forms', () => {

    it('should get a schema for a basic string field', () => {
      const schema = getJoiSchemaForDefinition({
        name: { type: String },
      });
      expect(Joi.isSchema(schema)).toBe(true);
    });

    it('should get a schema for shorthand string field', () => {
      const schema = getJoiSchemaForDefinition({
        name: String,
      });
      expect(Joi.isSchema(schema)).toBe(true);
    });

    it('should get a schema for string type', () => {
      const schema = getJoiSchemaForDefinition({
        name: { type: 'String' },
      });
      expect(Joi.isSchema(schema)).toBe(true);
    });

    it('should get a schema for shorthand string type', () => {
      const schema = getJoiSchemaForDefinition({
        name: 'String',
      });
      expect(Joi.isSchema(schema)).toBe(true);
    });

  });

  describe('basic functionality', () => {

    it('should always fail if no keys set', () => {
      const schema = getJoiSchemaForDefinition({
        name: String,
      });
      assertFail(schema, {});
    });

    it('should be able to strip specific fields', () => {
      const schema = getJoiSchemaForDefinition({
        name: String,
      }, {
        stripFields: [
          'id',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ],
      });
      assertPass(schema, { id: 1, name: 'foo' });
      assertPass(schema, { createdAt: 'date', name: 'foo' });
      assertPass(schema, { updatedAt: 'date', name: 'foo' });
      assertPass(schema, { deletedAt: 'date', name: 'foo' });
    });

    it('should be able to override required fields', () => {
      const schema = getJoiSchemaForDefinition({
        name: {
          type: String,
          required: true,
        },
        count: {
          type: Number,
          required: true,
        }
      }, {
        skipRequired: true,
      });
      assertPass(schema, { name: 'foo' });
      assertPass(schema, { count: 5 });
      assertFail(schema, {});
    });

  });

  describe('global options', () => {

    it('should validate a required field', () => {
      const schema = getJoiSchemaForDefinition({
        name: {
          type: String,
          required: true,
        },
      });
      assertPass(schema, { name: 'foo' });
      assertFail(schema, {});
    });

  });

  describe('string fields', () => {

    it('should validate an enum field', () => {
      const schema = getJoiSchemaForDefinition({
        name: {
          type: String,
          enum: ['foo', 'bar'],
        },
      });
      assertPass(schema, { name: 'foo' });
      assertPass(schema, { name: 'bar' });
      assertFail(schema, { name: 'baz' });
    });

    it('should validate minimum length', () => {
      const schema = getJoiSchemaForDefinition({
        name: {
          type: String,
          minLength: 3,
        },
      });
      assertPass(schema, { name: 'foo' });
      assertFail(schema, { name: 'fo' });
    });

    it('should validate maximum length', () => {
      const schema = getJoiSchemaForDefinition({
        name: {
          type: String,
          maxLength: 3,
        },
      });
      assertPass(schema, { name: 'foo' });
      assertFail(schema, { name: 'fooo' });
    });

    it('should validate minimum and maximum length together', () => {
      const schema = getJoiSchemaForDefinition({
        name: {
          type: String,
          minLength: 3,
          maxLength: 5,
        },
      });
      assertPass(schema, { name: 'foo' });
      assertPass(schema, { name: 'fooo' });
      assertFail(schema, { name: 'foooooo' });
    });

    it('should validate a matched field', () => {
      const schema = getJoiSchemaForDefinition({
        name: {
          type: String,
          match: /^foo$/,
        },
      });
      assertPass(schema, { name: 'foo' });
      assertFail(schema, { name: 'foo ' });
    });

    it('should convert string match field to regex', () => {
      const schema = getJoiSchemaForDefinition({
        name: {
          type: 'String',
          match: '^foo$',
        },
      });
      assertPass(schema, { name: 'foo' });
      assertFail(schema, { name: 'bar' });
    });

  });

  describe('number fields', () => {

    it('should validate an enum field', () => {
      const schema = getJoiSchemaForDefinition({
        count: {
          type: Number,
          enum: [100, 1000],
        },
      });
      assertPass(schema, { count: 100 });
      assertPass(schema, { count: 1000 });
      assertFail(schema, { count: 1001 });
    });

    it('should validate a minimum value', () => {
      const schema = getJoiSchemaForDefinition({
        count: {
          type: Number,
          min: 100,
        },
      });
      assertPass(schema, { count: 100 });
      assertFail(schema, { count: 99 });
    });

    it('should validate maximum value', () => {
      const schema = getJoiSchemaForDefinition({
        count: {
          type: Number,
          max: 100,
        },
      });
      assertPass(schema, { count: 100 });
      assertFail(schema, { count: 101 });
    });

    it('should validate minimum and maximum together', () => {
      const schema = getJoiSchemaForDefinition({
        count: {
          type: Number,
          min: 100,
          max: 200,
        },
      });
      assertPass(schema, { count: 100 });
      assertPass(schema, { count: 200 });
      assertFail(schema, { count: 99 });
      assertFail(schema, { count: 201 });
    });

  });

  describe('boolean fields', () => {

    it('should validate boolean field', () => {
      const schema = getJoiSchemaForDefinition({
        isActive: Boolean,
      });
      assertPass(schema, { isActive: true });
      assertPass(schema, { isActive: false });
    });

  });

  describe('date fields', () => {

    it('should validate date ISO-8601 field', () => {
      const schema = getJoiSchemaForDefinition({
        posted: Date,
      });
      assertPass(schema, { posted: '2020-01-01T00:00:00Z' });
      assertPass(schema, { posted: '2020-01-01T00:00:00' });
      assertFail(schema, { posted: 'January 1, 2020' });
    });

  });

  describe('reference fields', () => {

    it('should validate an ObjectId reference field', () => {
      const schema = getJoiSchemaForDefinition({
        image: {
          type: 'ObjectId',
          ref: 'Upload',
        },
      });
      assertPass(schema, { image: '5fd396fac80fa73203bd9554' });
      assertFail(schema, { image: 'bad id' });
    });

  });

  describe('array fields', () => {

    it('should validate array of strings', () => {
      const schema = getJoiSchemaForDefinition({
        categories: [{
          type: String,
        }],
      });
      assertPass(schema, { categories: ['foo'] });
      assertPass(schema, { categories: [] });
      assertFail(schema, { categories: 'foo' });
    });

    it('should validate array of object ids', () => {
      const schema = getJoiSchemaForDefinition({
        categories: [{
          type: 'ObjectId',
        }],
      });
      assertPass(schema, { categories: ['5fd396fac80fa73203bd9554'] });
      assertPass(schema, { categories: [] });
      assertFail(schema, { categories: ['bad id'] });
    });

    it('should validate minimum number of elements for required array field', () => {
      const schema = getJoiSchemaForDefinition({
        categories: [{
          type: String,
          required: true,
        }],
      });
      assertPass(schema, { categories: ['foo'] });
      assertFail(schema, { categories: [] });
      assertFail(schema, { categories: 'foo' });
    });

  });

  describe('nested fields', () => {

    it('should validate nested field', () => {
      const schema = getJoiSchemaForDefinition({
        counts: {
          view: Number,
        },
      });
      assertPass(schema, { counts: { view: 1 }});
      assertFail(schema, { counts: { view: 'bad number' }});
    });

    it('should validate explicit mixed type', () => {
      const schema = getJoiSchemaForDefinition({
        counts: {
          type: 'Mixed',
          view: Number,
        },
      });
      assertPass(schema, { counts: { view: 1 }});
      assertFail(schema, { counts: { view: 'bad number' }});
    });

    it('should validate mixed with nested type object', () => {
      const schema = getJoiSchemaForDefinition({
        type: { foo: String },
      });
      assertPass(schema, { type: { foo: 'foo' }});
      assertFail(schema, { type: 'foo' });
    });

  });

});

describe('getMongooseValidator', () => {
  it('should get an email validator', () => {
    const emailValidator = getMongooseValidator('email');
    expect(emailValidator('foo@bar.com')).toBe(true);
    expect(() => {
      emailValidator('bad@email');
    }).toThrow();
  });
});

const { getValidatorForDefinition } = require('../validator');
const { setupDb, teardownDb } = require('../../utils/testing');
const Joi = require('joi');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

function assertPass(validator, obj) {
  expect(() => {
    Joi.assert(obj, validator);
  }).not.toThrow();
}
function assertFail(validator, obj) {
  expect(() => {
    Joi.assert(obj, validator);
  }).toThrow();
}

describe('getValidatorForDefinition', () => {

  describe('alternate type forms', () => {

    it('should get a validator for a basic string field', () => {
      const validator = getValidatorForDefinition({
        name: { type: String },
      });
      expect(Joi.isSchema(validator)).toBe(true);
    });

    it('should get a validator for shorthand string field', () => {
      const validator = getValidatorForDefinition({
        name: String,
      });
      expect(Joi.isSchema(validator)).toBe(true);
    });

    it('should get a validator for string type', () => {
      const validator = getValidatorForDefinition({
        name: { type: 'String' },
      });
      expect(Joi.isSchema(validator)).toBe(true);
    });

    it('should get a validator for shorthand string type', () => {
      const validator = getValidatorForDefinition({
        name: 'String',
      });
      expect(Joi.isSchema(validator)).toBe(true);
    });

  });

  describe('basic functionality', () => {

    it('should always fail if no keys set', () => {
      const validator = getValidatorForDefinition({
        name: String,
      });
      assertFail(validator, {});
    });

    it('should be able to strip specific fields', () => {
      const validator = getValidatorForDefinition({
        name: String,
      }, {
        stripFields: [
          'id',
          'createdAt',
          'updatedAt',
          'deletedAt',
        ],
      });
      assertPass(validator, { id: 1, name: 'foo' });
      assertPass(validator, { createdAt: 'date', name: 'foo' });
      assertPass(validator, { updatedAt: 'date', name: 'foo' });
      assertPass(validator, { deletedAt: 'date', name: 'foo' });
    });

    it('should be able to override required fields', () => {
      const validator = getValidatorForDefinition({
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
      assertPass(validator, { name: 'foo' });
      assertPass(validator, { count: 5 });
      assertFail(validator, {});
    });

  });

  describe('global options', () => {

    it('should validate a required field', () => {
      const validator = getValidatorForDefinition({
        name: {
          type: String,
          required: true,
        },
      });
      assertPass(validator, { name: 'foo' });
      assertFail(validator, {});
    });

  });

  describe('string fields', () => {

    it('should validate an enum field', () => {
      const validator = getValidatorForDefinition({
        name: {
          type: String,
          enum: ['foo', 'bar'],
        },
      });
      assertPass(validator, { name: 'foo' });
      assertPass(validator, { name: 'bar' });
      assertFail(validator, { name: 'baz' });
    });

    it('should validate minimum length', () => {
      const validator = getValidatorForDefinition({
        name: {
          type: String,
          minLength: 3,
        },
      });
      assertPass(validator, { name: 'foo' });
      assertFail(validator, { name: 'fo' });
    });

    it('should validate maximum length', () => {
      const validator = getValidatorForDefinition({
        name: {
          type: String,
          maxLength: 3,
        },
      });
      assertPass(validator, { name: 'foo' });
      assertFail(validator, { name: 'fooo' });
    });

    it('should validate minimum and maximum length together', () => {
      const validator = getValidatorForDefinition({
        name: {
          type: String,
          minLength: 3,
          maxLength: 5,
        },
      });
      assertPass(validator, { name: 'foo' });
      assertPass(validator, { name: 'fooo' });
      assertFail(validator, { name: 'foooooo' });
    });

    it('should validate a matched field', () => {
      const validator = getValidatorForDefinition({
        name: {
          type: String,
          match: /^foo$/,
        },
      });
      assertPass(validator, { name: 'foo' });
      assertFail(validator, { name: 'foo ' });
    });

    it('should convert string match field to regex', () => {
      const validator = getValidatorForDefinition({
        name: {
          type: 'String',
          match: '^foo$',
        },
      });
      assertPass(validator, { name: 'foo' });
      assertFail(validator, { name: 'bar' });
    });

  });

  describe('number fields', () => {

    it('should validate an enum field', () => {
      const validator = getValidatorForDefinition({
        count: {
          type: Number,
          enum: [100, 1000],
        },
      });
      assertPass(validator, { count: 100 });
      assertPass(validator, { count: 1000 });
      assertFail(validator, { count: 1001 });
    });

    it('should validate a minimum value', () => {
      const validator = getValidatorForDefinition({
        count: {
          type: Number,
          min: 100,
        },
      });
      assertPass(validator, { count: 100 });
      assertFail(validator, { count: 99 });
    });

    it('should validate maximum value', () => {
      const validator = getValidatorForDefinition({
        count: {
          type: Number,
          max: 100,
        },
      });
      assertPass(validator, { count: 100 });
      assertFail(validator, { count: 101 });
    });

    it('should validate minimum and maximum together', () => {
      const validator = getValidatorForDefinition({
        count: {
          type: Number,
          min: 100,
          max: 200,
        },
      });
      assertPass(validator, { count: 100 });
      assertPass(validator, { count: 200 });
      assertFail(validator, { count: 99 });
      assertFail(validator, { count: 201 });
    });

  });

  describe('boolean fields', () => {

    it('should validate boolean field', () => {
      const validator = getValidatorForDefinition({
        isActive: Boolean,
      });
      assertPass(validator, { isActive: true });
      assertPass(validator, { isActive: false });
    });

  });

  describe('date fields', () => {

    it('should validate date ISO-8601 field', () => {
      const validator = getValidatorForDefinition({
        posted: Date,
      });
      assertPass(validator, { posted: '2020-01-01T00:00:00Z' });
      assertPass(validator, { posted: '2020-01-01T00:00:00' });
      assertFail(validator, { posted: 'January 1, 2020' });
    });

  });

  describe('reference fields', () => {

    it('should validate an ObjectId reference field', () => {
      const validator = getValidatorForDefinition({
        image: {
          type: 'ObjectId',
          ref: 'Upload',
        },
      });
      assertPass(validator, { image: '5fd396fac80fa73203bd9554' });
      assertFail(validator, { image: 'bad id' });
    });

  });

  describe('array fields', () => {

    it('should validate array of strings', () => {
      const validator = getValidatorForDefinition({
        categories: [{
          type: String,
        }],
      });
      assertPass(validator, { categories: ['foo'] });
      assertPass(validator, { categories: [] });
      assertFail(validator, { categories: 'foo' });
    });

    it('should validate array of object ids', () => {
      const validator = getValidatorForDefinition({
        categories: [{
          type: 'ObjectId',
        }],
      });
      assertPass(validator, { categories: ['5fd396fac80fa73203bd9554'] });
      assertPass(validator, { categories: [] });
      assertFail(validator, { categories: ['bad id'] });
    });

    it('should validate minimum number of elements for required array field', () => {
      const validator = getValidatorForDefinition({
        categories: [{
          type: String,
          required: true,
        }],
      });
      assertPass(validator, { categories: ['foo'] });
      assertFail(validator, { categories: [] });
      assertFail(validator, { categories: 'foo' });
    });

  });

  describe('nested fields', () => {

    it('should validate nested field', () => {
      const validator = getValidatorForDefinition({
        counts: {
          view: Number,
        },
      });
      assertPass(validator, { counts: { view: 1 }});
      assertFail(validator, { counts: { view: 'bad number' }});
    });

    it('should validate explicit mixed type', () => {
      const validator = getValidatorForDefinition({
        counts: {
          type: 'Mixed',
          view: Number,
        },
      });
      assertPass(validator, { counts: { view: 1 }});
      assertFail(validator, { counts: { view: 'bad number' }});
    });

    it('should validate mixed with nested type object', () => {
      const validator = getValidatorForDefinition({
        type: { foo: String },
      });
      assertPass(validator, { type: { foo: 'foo' }});
      assertFail(validator, { type: 'foo' });
    });

  });

});

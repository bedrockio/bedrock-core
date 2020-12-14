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

describe('string validations', () => {

  describe('type alternates', () => {

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

    it('should always fail if no keys set', () => {
      const validator = getValidatorForDefinition({
        name: String,
      });
      assertFail(validator, {});
    });

    it('should strip out internal fields', () => {
      const validator = getValidatorForDefinition({
        name: String,
      });
      assertPass(validator, { id: 1, name: 'foo' });
      assertPass(validator, { createdAt: 'date', name: 'foo' });
      assertPass(validator, { updatedAt: 'date', name: 'foo' });
      assertPass(validator, { deletedAt: 'date', name: 'foo' });
    });

  });

  describe('string options', () => {

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

  describe('number options', () => {

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

});


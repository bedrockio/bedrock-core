const Schema = require('../Schema');
const mongoose = require('mongoose');
const { setupDb, teardownDb } = require('../../test-helpers');

beforeAll(async () => {
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});


describe('Schema', () => {

  describe('basic functionality', () => {

    it('should be able to create basic schema', async () => {
      const schema = new Schema(
        {
          name: { type: String, validate: /[a-z]/ }
        },
      );
      const User = mongoose.model('SchemaUser1', schema);
      const user = new User({ name: 'foo' });

      expect(user.name).toBe('foo');
      expect(async () => {
        user.name = 'FOO';
        await user.save();
      }).rejects.toThrow();
    });
  });

  describe('defaults', () => {

    it('should add timestamps by default', async () => {
      const schema = new Schema();
      const User = mongoose.model('SchemaUser2', schema);
      const user = new User();
      await user.save();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should add deletedAt by default', async () => {
      const schema = new Schema();
      const User = mongoose.model('SchemaUser3', schema);
      const user = new User();
      await user.save();
      await user.delete();
      expect(user.deletedAt).toBeInstanceOf(Date);
    });

  });

  describe('serialization', () => {

    it('should expose id', () => {
      const schema = new Schema();
      const User = mongoose.model('SchemaUser4', schema);
      const user = new User();
      const data = JSON.parse(JSON.stringify(user));
      expect(data.id).toBe(user.id);
    });

    it('should not expose _id or __v', () => {
      const schema = new Schema();
      const User = mongoose.model('SchemaUser5', schema);
      const user = new User();
      const data = JSON.parse(JSON.stringify(user));
      expect(data._id).toBeUndefined();
      expect(data.__v).toBeUndefined();
    });

    it('should not expose fields with underscore or marked private', () => {
      const schema = new Schema({
        _private: String,
        password: { type: String, access: 'private' },
      });
      const User = mongoose.model('SchemaUser6', schema);
      const user = new User();
      user._private = 'private';
      user.password = 'fake password';

      expect(user._private).toBe('private');
      expect(user.password).toBe('fake password');

      const data = JSON.parse(JSON.stringify(user));

      expect(data._private).toBeUndefined();
      expect(data.password).toBeUndefined();
    });

  });
});

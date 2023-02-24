/* eslint no-console: 0 */

const mongoose = require('mongoose');
const { isFixture } = require('../../fixtures');

let stored;

function autoclean(schema) {
  schema.pre('save', function () {
    if (isFixture(this) && !this.isNew) {
      if (this.deleted) {
        console.error('Fixtures cannot be deleted as they may be used in other tests.');
      } else {
        console.error(
          [
            'Fixtures cannot be directly updated as they may be used in other tests.',
            'Instead create a new document or use $clone.',
          ].join('\n')
        );
      }
      throw new Error('Exited due to fixture update.');
    }
  });

  schema.post('save', function () {
    if (!isFixture(this)) {
      if (this.destroy) {
        stored.add(this);
      }
    }
  });

  schema.pre('remove', function () {
    if (isFixture(this)) {
      console.error('Fixtures cannot be deleted as they may be used in other tests.');
      throw new Error('Exited due to attempt to delete fixture.');
    }
  });

  schema.pre('deleteMany', function () {
    const filter = this.getFilter();
    const keys = Object.keys(filter);
    if (!keys.length) {
      const { modelName } = this.model;
      console.error(
        [
          `${modelName}.deleteMany() cannot be called in tests without a filter as this will`,
          'result in a loss of fixture data. Non-fixture documents created during',
          'tests are removed after each test has finished.',
        ].join('\n')
      );
      throw new Error('Exited due to deleteMany call.');
    }
  });
}

beforeEach(async () => {
  stored = new Set();
});

afterEach(async () => {
  if (stored) {
    await Promise.all(
      Array.from(stored).map((doc) => {
        return doc.destroy();
      })
    );
  }
});

mongoose.plugin(autoclean);

const mongoose = require('mongoose');
const { isFixture } = require('../fixtures');

let stored;

function autoclear(schema) {
  schema.post('save', function () {
    if (!isFixture(this)) {
      stored.add(this);
    }
  });

  schema.pre('deleteMany', function () {
    const filter = this.getFilter();
    const keys = Object.keys(filter);
    if (!keys.length) {
      const { modelName } = this.model;
      // eslint-disable-next-line
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
        return doc.remove();
      })
    );
  }
});

mongoose.plugin(autoclear);

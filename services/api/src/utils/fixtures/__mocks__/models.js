const mongoose = require('mongoose');
const { createSchema } = require('../../schema');

let count = 0;

function createModel(attributes) {
  return mongoose.model(`FixturesModel${count++}`, createSchema({ attributes }));
}

module.exports = {
  User: createModel({
    name: 'String',
  }),
  Post: createModel({
    content: 'String',
    nested: {
      nestedContent: 'String',
    },
  }),
};

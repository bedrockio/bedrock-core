const path = require('path');

module.exports = {
  ...jest.requireActual('../const'),
  BASE_DIR: path.join(__dirname, '../__fixtures__'),
};

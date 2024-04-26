const { loadFixtures, importFixtures, exportFixtures, isFixture, setOptions } = require('@bedrockio/fixtures');
const { createUpload } = require('./uploads');
const roles = require('../roles.json');

setOptions({
  roles,
  createUpload,
});

module.exports = {
  isFixture,
  loadFixtures,
  importFixtures,
  exportFixtures,
};

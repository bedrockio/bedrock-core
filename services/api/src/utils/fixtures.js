const { loadFixtures, importFixtures, exportFixtures, isFixture, setOptions } = require('@bedrockio/fixtures');
const { storeUploadedFile } = require('./uploads');
const roles = require('../roles.json');

setOptions({
  roles,
  storeUploadedFile,
});

module.exports = {
  isFixture,
  loadFixtures,
  importFixtures,
  exportFixtures,
};

const { loadFixtures, importFixtures, exportFixtures, isFixture, setOptions } = require('@bedrockio/fixtures');
const { storeUploadedFile } = require('./uploads');
const roles = require('../roles.json');

// Ensure models are loaded.
require('../models');

setOptions({
  getRoles() {
    return roles;
  },
  storeUploadedFile,
});

module.exports = {
  isFixture,
  loadFixtures,
  importFixtures,
  exportFixtures,
};

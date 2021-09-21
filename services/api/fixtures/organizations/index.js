const { kebabCase } = require('lodash');

const ORGANIZATIONS = ['Bedrock', 'Bedrock Institute', 'Bedrock University'];

const fixtures = {};
for (let name of ORGANIZATIONS) {
  fixtures[kebabCase(name)] = { name };
}

module.exports = fixtures;

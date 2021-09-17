const { Organization } = require('../../src/models');

const ORGANIZATIONS = ['Bedrock Inc.', 'Bedrock Institute', 'Bedrock University'];

module.exports = async () => {
  const organizations = {};
  await Promise.all(
    ORGANIZATIONS.map(async (name) => {
      organizations[name] = await Organization.create({
        name,
      });
    })
  );
  return organizations;
};

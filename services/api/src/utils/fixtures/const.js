const { kebabCase } = require('lodash');
const config = require('@bedrockio/config');
const roleDefinitions = require('../../roles.json');

const ENV = config.getAll();
const { ADMIN_EMAIL, ADMIN_PASSWORD } = ENV;

const ADMIN_FIXTURE_ID = 'users/admin';
const ORGANIZATION_FIXTURE_ID = 'organizations/default';

const CUSTOM_TRANSFORMS = {
  env(key) {
    return ENV[key];
  },
  async ref(key, meta, context) {
    return await context.importFixtures(key, meta);
  },
  async obj(key, meta, context) {
    const doc = await context.importFixtures(key, meta);
    return doc.toObject();
  },
};

const MODEL_TRANSFORMS = {
  User: {
    name(attributes) {
      // Note intentionally not using name defaults as this
      // can mask invalid fixtures which we want to error.
      const { name } = attributes;
      if (name) {
        const [firstName, ...rest] = name.split(' ');
        attributes.firstName = firstName;
        attributes.lastName = rest.join(' ');
        delete attributes.name;
      }
    },
    email(attributes) {
      if (!attributes.email) {
        const { firstName } = attributes;
        const domain = ADMIN_EMAIL.split('@')[1];
        attributes.email = `${kebabCase(firstName)}@${domain}`;
      }
    },
    async role(attributes, meta, context) {
      const { role } = attributes;
      if (role) {
        const def = roleDefinitions[role];
        if (def.allowScopes.includes('global')) {
          attributes.roles = [{ role, scope: 'global' }];
        } else {
          const organization = await context.importFixtures(ORGANIZATION_FIXTURE_ID, meta);
          attributes.roles = [{ role, scope: 'organization', scopeRef: organization.id }];
        }
        delete attributes.role;
      }
    },
    password(attributes) {
      if (!attributes.password) {
        attributes.password = ADMIN_PASSWORD;
      }
    },
  },
};

module.exports = {
  MODEL_TRANSFORMS,
  CUSTOM_TRANSFORMS,
  ADMIN_FIXTURE_ID,
};

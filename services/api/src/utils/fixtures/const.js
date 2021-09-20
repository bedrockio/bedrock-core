const { kebabCase } = require('lodash');
const config = require('@bedrockio/config');
const roleDefinitions = require('../../roles.json');

const ENV = config.getAll();
const { ADMIN_EMAIL, ADMIN_PASSWORD } = ENV;

const ADMIN_PATH = 'users/admin';

const CUSTOM_TRANSFORMS = {
  env(key) {
    return ENV[key];
  },
  async ref(key, meta, context) {
    return await context.importFixtures(key, meta);
  },
};

const DEFAULT_TRANSFORMS = {
  User: {
    name(attributes) {
      // Note intentionally not using name defaults as this can mask
      // invalid fixtures which we want to error.
      const { name } = attributes;
      if (name) {
        attributes.firstName = name.split(' ')[0];
        attributes.lastName = name.split(' ').slice(1).join(' ');
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
          const institution = await context.importFixtures('institutions/wqu', meta);
          attributes.roles = [{ role, scope: 'institution', scopeRef: institution.id }];
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
  CUSTOM_TRANSFORMS,
  DEFAULT_TRANSFORMS,
  ADMIN_PATH,
};

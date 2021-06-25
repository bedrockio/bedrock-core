const { Organization } = require('../../models');
const config = require('@bedrockio/config');

const APP_NAME = config.get('APP_NAME');

function fetchOrganization() {
  return async (ctx, next) => {
    const identifier = ctx.request.get('organization') || '';
    if (identifier) {
      const organization = await Organization.findById(identifier);
      if (!organization) {
        return ctx.throw(404, `Can't find organization with ID or slug ${identifier}`);
      }
      ctx.state.organization = organization;
    } else {
      ctx.state.organization =
        (await Organization.findOne({ name: APP_NAME })) || (await Organization.create({ name: APP_NAME }));
    }
    return next();
  };
}

module.exports = {
  fetchOrganization,
};

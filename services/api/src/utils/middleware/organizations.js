const { Organization } = require('./../models');

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
        (await Organization.findOne({ name: 'Default' })) || (await Organization.create({ name: 'Default' }));
    }
    return next();
  };
}

module.exports = {
  fetchOrganization,
};

const { Organization } = require('../../models');
const config = require('@bedrockio/config');

const DEFAULT_ORGANIZATION_NAME = config.get('DEFAULT_ORGANIZATION_NAME');

async function organization(ctx, next) {
  const identifier = ctx.request.get('organization') || '';

  if (identifier) {
    const organization = await Organization.findById(identifier);
    if (!organization) {
      return ctx.throw(404, `Can't find organization with ID or slug ${identifier}`);
    }
    ctx.state.organization = organization;
  } else if (DEFAULT_ORGANIZATION_NAME) {
    const organization = await Organization.findOneAndUpdate(
      { name: DEFAULT_ORGANIZATION_NAME },
      { name: DEFAULT_ORGANIZATION_NAME },
      { new: true, upsert: true }
    );
    ctx.state.organization = organization;
  }
  return next();
}

module.exports = organization;

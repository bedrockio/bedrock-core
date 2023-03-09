const mongoose = require('mongoose');
const { lowerFirst } = require('lodash');

function fetchByParam(Model, options) {
  const docName = lowerFirst(Model.modelName);
  return async (id, ctx, next) => {
    const { include } = ctx.query;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ctx.throw(404);
    }
    const doc = await Model.findById(id).include(include);
    if (!doc) {
      ctx.throw(404);
    } else if (!(await checkAccess(ctx, doc, options))) {
      ctx.throw(401);
    }
    ctx.state[docName] = doc;
    return next();
  };
}

function fetchByParamWithSlug(Model, options) {
  const docName = lowerFirst(Model.modelName);
  return async (id, ctx, next) => {
    const { include } = ctx.query;
    const doc = await Model.findByIdOrSlug(id).include(include);
    if (!doc) {
      ctx.throw(404);
    } else if (!(await checkAccess(ctx, doc, options))) {
      ctx.throw(401);
    }
    ctx.state[docName] = doc;
    return next();
  };
}

async function checkAccess(ctx, doc, options = {}) {
  const { hasAccess = () => true } = options;
  return await hasAccess(ctx, doc);
}

module.exports = {
  fetchByParam,
  fetchByParamWithSlug,
};

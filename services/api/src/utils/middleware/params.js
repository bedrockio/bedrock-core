import mongoose from 'mongoose';
import { lowerFirst } from 'lodash-es';

function fetchByParam(Model, options = {}) {
  const docName = options.as || lowerFirst(Model.modelName);
  return async (id, ctx, next) => {
    let include = ctx.query?.include;
    include ||= ctx.request.body?.include;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ctx.throw(404);
    }
    try {
      const doc = await Model.findById(id).include(include);
      if (!doc) {
        ctx.throw(404);
      } else if (!(await checkAccess(ctx, doc, options))) {
        ctx.throw(403);
      }
      ctx.state[docName] = doc;
      excludeFromUniqueChecks(ctx, doc);
    } catch (error) {
      ctx.throw(400, error);
    }
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
    excludeFromUniqueChecks(ctx, doc);
    return next();
  };
}

// Unique checks in update validation exclude the target document by an id in
// the body, which clients have no reason to send. Take it from the document the
// route already resolved. Update validation strips it again before assign.
function excludeFromUniqueChecks(ctx, doc) {
  if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
    ctx.request.body.id = doc.id;
  }
}

async function checkAccess(ctx, doc, options = {}) {
  const { hasAccess = () => true } = options;
  return await hasAccess(ctx, doc);
}

// Middleware setting the user to authUser.
// This is for interop with the validate middleware
// when performing "self" checks for "writeAccess".
function isSelf(ctx, next) {
  ctx.state.user = ctx.state.authUser;
  excludeFromUniqueChecks(ctx, ctx.state.authUser);
  return next();
}

export { isSelf, fetchByParam, fetchByParamWithSlug };

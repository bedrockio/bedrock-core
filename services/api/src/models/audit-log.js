const mongoose = require('mongoose');
const { createSchema } = require('../utils/schema');
const { pick, isEmpty } = require('lodash');

const definition = require('./definitions/audit-log.json');

const schema = createSchema(definition.attributes);

schema.statics.getFieldsContext = function (ctx) {
  return {
    user: ctx.state.authUser?.id,
    requestMethod: ctx.request.method,
    requestUrl: ctx.request.url,
    routeNormalizedPath: ctx.routerPath,
    routePrefix: ctx.router.opts.prefix,
  };
};

schema.statics.getDiffObject = function getDiffObject(object, fields) {
  const pathsModified = object.directModifiedPaths();
  return pick(pick(object.toObject(), pathsModified), fields);
};

schema.statics.append = function (activity, { ctx, type, objectDiff, objectId, objectType, user }) {
  const fromContext = this.getFieldsContext(ctx);

  return this.create({
    ...fromContext,
    activity,
    objectId,
    objectDiff: isEmpty(objectDiff) ? undefined : objectDiff,
    objectType,
    type,
    user: user || fromContext.user,
  });
};

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', schema);

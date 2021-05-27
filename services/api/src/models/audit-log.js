const mongoose = require('mongoose');
const { createSchema } = require('../utils/schema');
const { get, pick, isEmpty, intersection } = require('lodash');

const definition = require('./definitions/audit-log.json');

const schema = createSchema(definition.attributes);

schema.statics.getContextFields = function (ctx) {
  return {
    user: ctx.state.authUser?.id,
    requestMethod: ctx.request.method,
    requestUrl: ctx.request.url,
    routeNormalizedPath: ctx.routerPath,
    routePrefix: ctx.router.opts.prefix,
  };
};

schema.statics.getObjectFields = function getObjectFields(object, fields = [], isNew = false) {
  const isMongooseDoc = object instanceof mongoose.Model;
  if (!isMongooseDoc) throw Error('AuditLog.getObjectFields only works with mongoose documents');

  const objectFields = {
    objectId: object.id,
    objectType: object.constructor.modelName,
  };

  if (fields.length) {
    if (isNew) {
      objectFields.objectAfter = pick(object.toObject({ depopulate: true }), fields);
    } else {
      const { auditOriginal, auditPathsModified } = object.$locals;
      // the mongoose's Document.directModifiedPaths() returns falsely the objectId modified (quite possible due to autopopulate)
      // this corrects any issues that happens when comparing with objectIds
      const pathsModified = intersection(auditPathsModified, fields).filter((field) => {
        if (!object.get(field).equals) return true;
        return !object.get(field).equals(get(auditOriginal, field));
      });

      const after = pick(pick(object.toObject({ depopulate: true }), pathsModified), fields);

      if (!isEmpty(after)) {
        const before = pick(pick(auditOriginal, pathsModified), fields);
        objectFields.objectAfter = after;
        objectFields.objectBefore = before;
      }
    }
  }

  return objectFields;
};

schema.statics.append = function (activity, ctx, { objectId, objectType, objectBefore, objectAfter, type, user }) {
  const fromContext = this.getContextFields(ctx);

  // dont append to the log if nothing changed
  if (isEmpty(objectAfter) && objectAfter !== undefined) {
    return;
  }

  const args = {
    ...fromContext,
    activity,
    objectId: objectId,
    objectType: objectType,
    objectBefore,
    objectAfter,
    type,
    user: user || fromContext.user,
  };

  return this.create(args);
};

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', schema);

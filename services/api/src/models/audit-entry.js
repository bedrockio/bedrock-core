const mongoose = require('mongoose');
const { createSchema } = require('../utils/schema');
const { get, pick, isEmpty, intersection } = require('lodash');

const definition = require('./definitions/audit-entry.json');

const schema = createSchema(definition);

schema.statics.getContextFields = function (ctx) {
  return {
    user: ctx.state.authUser?.id,
    requestMethod: ctx.request.method,
    requestUrl: ctx.request.url,
    routeNormalizedPath: ctx.routerPath,
  };
};

schema.statics.getObjectFields = function getObjectFields(object, fields = []) {
  const isMongooseDoc = object instanceof mongoose.Model;
  if (!isMongooseDoc) throw Error('AuditEntry.getObjectFields only works with mongoose documents');

  const objectFields = {
    objectId: object.id,
    objectType: object.constructor.modelName,
  };

  if (fields.length) {
    const { original, pathsModified, isNew } = object.$locals;
    // the mongoose's Document.directModifiedPaths() returns falsely the objectId modified (quite possible due to autopopulate)
    // this corrects any issues that happens when comparing with objectIds
    // if isNew then just take all fields, as they will all be new
    const filteredPaths = isNew
      ? fields
      : intersection(pathsModified, fields).filter((field) => {
          if (!object.get(field).equals) return true;
          return !object.get(field).equals(get(original, field));
        });

    if (isNew) {
      objectFields.objectAfter = pick(object.toObject({ depopulate: true }), filteredPaths);
    } else {
      const after = pick(object.toObject({ depopulate: true }), filteredPaths);
      if (!isEmpty(after)) {
        const before = pick(original, filteredPaths);
        objectFields.objectAfter = after;
        objectFields.objectBefore = before;
      }
    }
  }

  return objectFields;
};

schema.statics.append = function (activity, ctx, { object, fields, category, ...options }) {
  const fromContext = this.getContextFields(ctx);

  if (object) {
    Object.assign(options, this.getObjectFields(object, fields), options);
  }

  // dont append to the log if nothing changed
  if (isEmpty(options.objectAfter) && options.objectAfter !== undefined) {
    return;
  }

  return this.create({
    ...fromContext,
    activity,
    objectId: options.objectId,
    objectType: options.objectType,
    objectBefore: options.objectBefore,
    objectAfter: options.objectAfter,
    category,
    user: options.user || fromContext.user,
  });
};

schema.index({  category: 1, objectType: 1, createdAt: 1, activity: 1, routeNormalizedPath: 1 });

module.exports = mongoose.models.AuditEntry || mongoose.model('AuditEntry', schema);

const mongoose = require('mongoose');
const { createSchema } = require('@bedrockio/model');
const { isEmpty } = require('lodash');

const definition = require('./definitions/audit-entry.json');

const schema = createSchema(definition);

schema.statics.getContextFields = function (options) {
  const { ctx } = options;
  return {
    user: options.user?.id || ctx.state.authUser?.id,
    requestMethod: ctx.request.method,
    requestUrl: ctx.request.url,
    routeNormalizedPath: ctx.routerPath,
  };
};

schema.statics.getObjectFields = function (options) {
  const { fields, object, snapshot = {} } = options;

  if (object) {
    if (!(object instanceof mongoose.Model)) {
      throw Error('AuditEntry.getObjectFields only works with mongoose documents');
    }

    snapshot.depopulate?.();
    object.depopulate?.();

    let result = {
      objectId: object.id,
      objectType: object.constructor.modelName,
    };

    if (fields) {
      let objectBefore;
      let objectAfter;
      for (let field of fields) {
        const sValue = snapshot[field];
        const oValue = object[field];
        if (sValue !== oValue) {
          if (sValue !== undefined) {
            objectBefore ||= {};
            objectBefore[field] = sValue;
          }
          if (oValue !== undefined) {
            objectAfter ||= {};
            objectAfter[field] = oValue;
          }
        }
      }
      result = {
        ...result,
        objectBefore,
        objectAfter,
      };
    }
    return result;
  }
};

schema.statics.append = function (activity, options) {
  const { category } = options;

  const objectFields = this.getObjectFields(options);

  // Dont append to the log if nothing changed
  if (objectFields?.objectAfter && isEmpty(objectFields.objectAfter)) {
    return;
  }

  return this.create({
    ...this.getContextFields(options),
    ...objectFields,
    activity,
    category,
  });
};

schema.index({ category: 1, objectType: 1, createdAt: 1, activity: 1, routeNormalizedPath: 1 });

module.exports = mongoose.models.AuditEntry || mongoose.model('AuditEntry', schema);

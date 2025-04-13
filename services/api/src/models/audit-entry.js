const mongoose = require('mongoose');
const { createSchema } = require('@bedrockio/model');
const { isEmpty, get } = require('lodash');

const definition = require('./definitions/audit-entry.json');

const schema = createSchema(definition);

schema.statics.getContextFields = function (ctx) {
  return {
    requestMethod: ctx.request.method,
    requestUrl: ctx.request.url,
    routeNormalizedPath: ctx.routerPath,
  };
};

schema.statics.getObjectFields = function (options) {
  let { fields, object, snapshot = {} } = options;

  if (object) {
    if (!(object instanceof mongoose.Model)) {
      throw Error('AuditEntry.getObjectFields only works with mongoose documents');
    }

    // Depopulate mutates the object so clone it here.
    object = object.$clone();

    snapshot.depopulate?.();
    object.depopulate?.();

    const paths = object.constructor.schema.paths;

    let ownerPath = options.ownerPath;

    if (!ownerPath && paths['owner']) {
      ownerPath = 'owner';
    } else if (!ownerPath && paths['user']) {
      ownerPath = 'user';
    }

    const schemaField = paths[ownerPath];
    const ownerType = schemaField?.options?.ref;
    // keep in mind the ownerPath might be a nested path `location.user`
    const ownerId = get(object, ownerPath);

    let result = {
      object: object.id,
      objectType: object.constructor.modelName,
      ownerId,
      ownerType,
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
  const { ctx, category } = options;

  const objectFields = this.getObjectFields(options);

  // Dont append to the log if nothing changed
  if (objectFields?.objectAfter && isEmpty(objectFields.objectAfter)) {
    return;
  }

  return this.create({
    ...this.getContextFields(ctx),
    ...objectFields,
    actor: options.actor?.id || options.user?.id || ctx.state.authUser?.id,
    activity,
    category,
  });
};

schema.index({ category: 1, createdAt: 1 });
schema.index({ activity: 1, createdAt: 1 });
schema.index({ actor: 1, createdAt: 1 });
schema.index({ ownerId: 1, createdAt: 1 });
schema.index({ object: 1, createdAt: 1 });

module.exports = mongoose.models.AuditEntry || mongoose.model('AuditEntry', schema);

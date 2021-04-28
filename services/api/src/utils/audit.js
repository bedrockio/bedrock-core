const { AuditLog } = require('../models');
const { isEmpty } = require('lodash');

class Audit {
  static fromContext(ctx) {
    return {
      userId: ctx.state.authUser?.id,
      requestMethod: ctx.request.method,
      requestPath: ctx.request.method,
      requestNormalizedPath: ctx._matchedRoute,
    };
  }

  static getDiff(object, fields) {
    const pathsModified = object.directModifiedPaths();
    // TODO soemthing need to happen here.
    // to return only the fields that was provided via the fields
    // we can use the directModifiedPaths to figure out what fields where changed
    return {};
  }

  static delete(ctx, action, objectId) {
    return this.createEntry({ type: 'delete', ctx, action, objectId });
  }

  static update(ctx, action, objectId, diffObject) {
    return this.createEntry({ type: 'update', ctx, action, objectId, diffObject });
  }

  static create(ctx, action, objectId, diffObject) {
    return this.createEntry({ type: 'create', ctx, action, objectId, diffObject });
  }

  static read(ctx, action, objectId) {
    return this.createEntry({ type: 'read', ctx, action, objectId });
  }

  static createEntry({ ctx, action, objectId, diffObject, type }) {
    if (!ctx) throw Error('[audit.create] ctx is required');
    if (!objectId) throw Error('[audit.create] objectId is required');
    if (!action) throw Error('[audit.create] action is required');
    if (!type) throw Error('[audit.type] action is required');

    if (action === 'update' && isEmpty(diffObject)) {
      //nothing was changed no need to record;
      return;
    }

    return AuditLog.create({
      ...this.fromContext(),
      type,
      action,
      diffObject,
    });
  }
}

module.exports = Audit;

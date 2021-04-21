const mongoose = require('mongoose');

const { Schema } = mongoose;

const auditSymbol = Symbol('audit');

const schema = new Schema({
  userId: Schema.Types.ObjectId,
  collectionName: String,
  objectId: Schema.Types.ObjectId,
  object: Schema.Types.Mixed,
  requestUrl: String,
  requestMethod: String,
  requestBody: Schema.Types.Mixed,
  requestQuery: Schema.Types.Mixed,
  action: String,
});

const AuditHistory = mongoose.model('User', schema);

function save(ctx, { user, object, collectionName, action }) {
  return AuditHistory.create({
    userId: user.id,
    collectionName: object.collection.collectionName || collectionName,
    objectId: object.id,
    object,
    requestUrl: ctx.request.url,
    requestMethod: ctx.request.method,
    requestQuery: ctx.request.query,
    action: action || ctx._matchedRouteName,
  });
}

function setupMiddleware({ getUser = (ctx) => ctx.state.authUser }) {
  return (ctx, next) => {
    ctx[auditSymbol] = {};
    return next().then(() => {
      const auditContext = ctx[auditSymbol] || {};
      const user = auditContext.user || getUser(ctx);
      const object = auditContext.object;
      const collectionName = auditContext.collectionName;

      if (!user) {
        ctx.logger.warn('[Audit] no user set');
        return;
      }

      return save(ctx, {
        user,
        object,
        collectionName,
      });
    });
  };
}

function setUser(ctx, user) {
  ctx[auditSymbol].user = user.toObject();
}

function setObject(ctx, object) {
  ctx[auditSymbol].collectionName = object.collection.collectionName;
  ctx[auditSymbol].object = object.toObject();
  ctx[auditSymbol].objectVersion = object._v;
}

module.exports = {
  setup: setupMiddleware,
  setUser,
  setObject,
  save,
  AuditHistory,
};

const mongoose = require('mongoose');
const { Stream } = require('node:stream');
const { isPlainObject } = require('lodash');

function serializeDocument(doc, ctx) {
  const { authUser } = ctx.state;
  return doc.toObject({
    ...ctx.state,
    scopes: authUser?.getScopes(),
  });
}

function serializeObject(obj, ctx) {
  if (obj instanceof Stream) {
    return obj;
  } else if (obj instanceof mongoose.Model) {
    return serializeDocument(obj, ctx);
  } else if (Array.isArray(obj)) {
    return obj.map((el) => {
      return serializeObject(el, ctx);
    });
  } else if (isPlainObject(obj)) {
    const mapped = {};
    for (let [key, val] of Object.entries(obj || {})) {
      mapped[key] = serializeObject(val, ctx);
    }
    return mapped;
  } else {
    return obj;
  }
}

module.exports = {
  serializeObject,
  serializeDocument,
};

const mongoose = require('mongoose');

function serializeDocument(doc, ctx) {
  const { authUser } = ctx.state;
  return doc.toObject({
    ...ctx.state,
    scopes: authUser?.getScopes(),
  });
}

function serializeObject(obj, ctx) {
  if (obj instanceof mongoose.Model) {
    return serializeDocument(obj, ctx);
  } else if (Array.isArray(obj)) {
    return obj.map((el) => {
      return serializeObject(el, ctx);
    });
  } else if (typeof obj === 'object') {
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

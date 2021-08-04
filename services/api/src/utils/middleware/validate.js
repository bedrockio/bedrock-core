const Joi = require('joi');

const DEFAULT_OPTIONS = {
  allowUnknown: false,
  abortEarly: false,
};

function validateBody(schema, options) {
  const validator = getValidator(schema, options);
  return (ctx, next) => {
    const { value, error } = validator(ctx.request.body);
    if (error) {
      ctx.throw(getErrorCode(error), error);
    }
    ctx.request.body = value;
    return next();
  };
}

function validateQuery(schema, options) {
  const validator = getValidator(schema, options);
  return (ctx, next) => {
    const { value, error } = validator(ctx.request.query);
    if (error) {
      ctx.throw(getErrorCode(error), error);
    }

    // Koa (and the koa-qs module) uses a setter which causes the
    // query object to be stringified into a querystring when setting it
    // through `ctx.query =` or `ctx.request.query =`. The getter will then
    // parse the string whenever you request `ctx.request.query` or `ctx.query`
    // which will destroy Joi's automatic type conversion
    // making everything a string as soon as you set it.
    //
    // To get around this, when we're validating a query, we overwrite the
    // default query getter so it returns the converted object instead of the
    // idiotic stringified object if nothing about the querystring was changed:

    const originalQueryGetter = ctx.request.query;
    const src = {
      get orginalQuery() {
        return originalQueryGetter;
      },
      get query() {
        // https://github.com/koajs/koa/blob/9cef2db87e3066759afb9f002790cc24677cc913/lib/request.js#L168
        if (!this._querycache && Object.keys(value || {}).length) {
          return value;
        }
        return this._querycache && this._querycache[this.querystring] ? value : originalQueryGetter;
      },
    };
    Object.getOwnPropertyNames(src).forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(src, name);
      Object.defineProperty(ctx.request, name, descriptor);
    });

    return next();
  };
}

function getValidator(schema, options = {}) {
  schema = Joi.isSchema(schema) ? schema : Joi.object(schema);
  options = { ...DEFAULT_OPTIONS, ...options };
  return (obj = {}) => {
    const { value, error } = schema.validate(obj, options);
    if (error) {
      error.details = error.details.map((detail) => {
        return {
          ...detail,
          meta: {
            parsedValue: value[detail.path],
            // Explicitly show it was not provided
            providedValue: obj[detail.path] || null,
          },
        };
      });
    }
    return { value, error };
  };
}

function getErrorCode(error) {
  const isPermissions = error.details.every((err) => {
    return err.context.permissions;
  });
  return isPermissions ? 401 : 400;
}

module.exports = {
  validateBody,
  validateQuery,
};

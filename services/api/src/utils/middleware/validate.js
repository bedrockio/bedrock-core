const yd = require('@bedrockio/yada');
const { PermissionsError } = require('../validation');

function validateBody(arg) {
  const schema = resolveSchema(arg);
  return async (ctx, next) => {
    try {
      ctx.request.body = await schema.validate(ctx.request.body);
    } catch (error) {
      ctx.throw(getErrorCode(error), error);
    }
    return await next();
  };
}

function validateQuery(arg) {
  const schema = resolveSchema(arg);
  return async (ctx, next) => {
    let query;
    try {
      query = await schema.validate(ctx.request.query, {
        cast: true,
      });
    } catch (error) {
      ctx.throw(getErrorCode(error), error);
    }

    // TODO: is this needed??

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

    const originalQueryGetter = query;
    const src = {
      get orginalQuery() {
        return originalQueryGetter;
      },
      get query() {
        // https://github.com/koajs/koa/blob/9cef2db87e3066759afb9f002790cc24677cc913/lib/request.js#L168
        if (!this._querycache && Object.keys(query || {}).length) {
          return query;
        }
        return this._querycache && this._querycache[this.querystring] ? query : originalQueryGetter;
      },
    };
    Object.getOwnPropertyNames(src).forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(src, name);
      Object.defineProperty(ctx.request, name, descriptor);
    });

    return next();
  };
}

function resolveSchema(arg) {
  return yd.isSchema(arg) ? arg : yd.object(arg);
}

function getErrorCode(error) {
  return isPermissionsError(error) ? 401 : 400;
}

function isPermissionsError(error) {
  if (error.details) {
    return error.details.every(isPermissionsError);
  } else if (error.original) {
    return error.original instanceof PermissionsError;
  }
}

module.exports = {
  validateBody,
  validateQuery,
};

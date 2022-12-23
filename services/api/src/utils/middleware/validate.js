const qs = require('qs');
const yd = require('@bedrockio/yada');
const { PermissionsError } = require('../validation');

function validateBody(arg) {
  return wrapMiddleware(arg, (schema) => {
    return async (ctx, next) => {
      try {
        ctx.request.body = await schema.validate(ctx.request.body);
      } catch (error) {
        ctx.throw(getErrorCode(error), error);
      }
      return await next();
    };
  });
}

function validateQuery(arg) {
  return wrapMiddleware(arg, (schema) => {
    return async (ctx, next) => {
      try {
        const parsed = qs.parse(ctx.request.query);
        const result = await schema.validate(parsed, {
          cast: true,
        });
        // ctx.request.query is a getter/setter so override
        Object.defineProperty(ctx.request, 'query', {
          value: result,
        });
      } catch (error) {
        ctx.throw(getErrorCode(error), error);
      }
      return next();
    };
  });
}

function wrapMiddleware(arg, fn) {
  const schema = yd.isSchema(arg) ? arg : yd.object(arg);
  // Expose schema to document generator.
  fn.schema = schema;
  return fn;
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

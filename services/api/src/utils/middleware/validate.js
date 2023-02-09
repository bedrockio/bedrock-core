const qs = require('qs');
const yd = require('@bedrockio/yada');
const { PermissionsError, ImplementationError } = require('@bedrockio/model');

function validateBody(arg) {
  const schema = resolveSchema(arg);
  return async (ctx, next) => {
    try {
      ctx.request.body = await schema.validate(ctx.request.body, {
        ...ctx.state,
      });
    } catch (error) {
      ctx.throw(getErrorCode(error), error);
    }
    return await next();
  };
}

function validateQuery(arg) {
  const schema = resolveSchema(arg);
  return async (ctx, next) => {
    try {
      const parsed = qs.parse(ctx.request.query);
      const result = await schema.validate(parsed, {
        ...ctx.state,
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
}

function resolveSchema(arg) {
  return yd.isSchema(arg) ? arg : yd.object(arg);
}

function getErrorCode(error) {
  if (isImplementationError(error)) {
    return 500;
  } else if (isPermissionsError(error)) {
    return 401;
  } else {
    return 400;
  }
}

function isPermissionsError(error) {
  if (error.details) {
    return error.details.every(isPermissionsError);
  } else if (error.original) {
    return error.original instanceof PermissionsError;
  }
}

function isImplementationError(error) {
  if (error.details) {
    return error.details.some(isImplementationError);
  } else if (error.original) {
    return error.original instanceof ImplementationError;
  }
}

module.exports = {
  validateBody,
  validateQuery,
};

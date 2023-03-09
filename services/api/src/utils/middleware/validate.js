const qs = require('qs');
const yd = require('@bedrockio/yada');
const { PermissionsError, ImplementationError } = require('@bedrockio/model');

function validateBody(arg) {
  const schema = resolveSchema(arg);
  return async (ctx, next) => {
    try {
      const { authUser } = ctx.state;
      ctx.request.body = await schema.validate(ctx.request.body, {
        ...ctx.state,
        scopes: authUser?.getScopes(),
      });
    } catch (error) {
      throwError(ctx, error);
    }
    return await next();
  };
}

function validateQuery(arg) {
  const schema = resolveSchema(arg);
  return async (ctx, next) => {
    try {
      const { authUser } = ctx.state;
      const parsed = qs.parse(ctx.request.query);
      const result = await schema.validate(parsed, {
        ...ctx.state,
        scopes: authUser?.getScopes(),
        cast: true,
      });
      // ctx.request.query is a getter/setter so override
      Object.defineProperty(ctx.request, 'query', {
        value: result,
      });
    } catch (error) {
      throwError(ctx, error);
    }
    return next();
  };
}

function resolveSchema(arg) {
  return yd.isSchema(arg) ? arg : yd.object(arg);
}

function throwError(ctx, error) {
  if (isImplementationError(error)) {
    ctx.throw(500, error.getFullMessage());
  } else if (isPermissionsError(error)) {
    ctx.throw(401, error);
  } else {
    ctx.throw(400, error);
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

const qs = require('qs');
const yd = require('@bedrockio/yada');
const { PermissionsError, ImplementationError } = require('@bedrockio/model');

function validateBody(arg) {
  const schema = resolveSchema(arg);
  return wrapSchema(schema, 'body', async (ctx, next) => {
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
  });
}

function validateQuery(arg) {
  const schema = resolveSchema(arg);
  return wrapSchema(schema, 'query', async (ctx, next) => {
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
  });
}

function validateDelete(schema) {
  return wrapSchema(schema, 'delete', async (ctx, next) => {
    try {
      const { authUser } = ctx.state;
      await schema.validate(null, {
        ...ctx.state,
        scopes: authUser?.getScopes(),
      });
    } catch (error) {
      throwError(ctx, error);
    }
    return next();
  });
}

function validateFiles() {
  const schema = yd
    .object({
      file: yd.allow(yd.array(yd.object()), yd.object()).required(),
    })
    .required();
  return wrapSchema(schema, 'files', async (ctx, next) => {
    try {
      await schema.validate(ctx.request.files);
    } catch (error) {
      throwError(ctx, error);
    }
    return next();
  });
}

function wrapSchema(schema, type, fn) {
  // Allows docs to see the schema on the middleware
  // layer to generate an OpenApi definition for it.
  fn.validation = {
    type,
    schema,
  };
  return fn;
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
  validateFiles,
  validateDelete,
};

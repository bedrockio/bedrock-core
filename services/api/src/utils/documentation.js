import { Stream } from 'stream';
import yd from '@bedrockio/yada';
import config from '@bedrockio/config';
import { mapValues } from 'lodash-es';
import { serializeObject } from './serialize.js';

const ENV_NAME = config.get('ENV_NAME');

/**
 * Bundles documentation parts into a route middleware that the OpenAPI generator reads.
 * In the test environment it also asserts that success bodies match a declared variant.
 * @param {...object} parts - Results of `description`, `success` and `error`.
 */
function include(...parts) {
  let middleware;
  if (ENV_NAME === 'test') {
    middleware = async (ctx, next) => {
      await next();
      await assertResponse(ctx, parts);
    };
  } else {
    middleware = (ctx, next) => {
      return next();
    };
  }
  middleware.documentation = parts;
  return middleware;
}

/**
 * Sets the operation summary and description.
 * @param {string} summary
 * @param {string} [description]
 */
function description(summary, description) {
  return { type: 'description', summary, description };
}

/**
 * Declares one success response variant. A status may have several.
 * @param {number} status
 * @param {object} [options]
 * @param {string} [options.description]
 * @param {object} [options.schema] - A yada schema, or an object of them. Models become refs.
 * @param {*} [options.example] - Validated against `schema` when the definition is generated.
 * @param {string} [options.name] - Example key; defaults to a slug of `description`.
 */
function success(status, options = {}) {
  const { schema, ...rest } = options;
  return {
    type: 'success',
    status,
    ...rest,
    ...(schema && {
      schema: resolveSchema(schema),
    }),
  };
}

/**
 * Declares an error response with the shared error body. Reserve it for errors a client
 * must handle specially; routine validation and not-found errors stay undocumented.
 * @param {number} status
 * @param {string} description
 */
function error(status, description) {
  return { type: 'error', status, description };
}

// Models are open objects tagged for the generator to replace with a $ref.
function resolveSchema(arg) {
  if (yd.isSchema(arg)) {
    return arg;
  } else if (arg.modelName) {
    return yd.object().tag({ 'x-ref': arg.modelName });
  } else if (Array.isArray(arg)) {
    return yd.array(resolveSchema(arg[0]));
  } else {
    return yd.object(mapValues(arg, resolveSchema));
  }
}

async function assertResponse(ctx, parts) {
  const variants = parts.filter((part) => {
    return part.type === 'success';
  });
  if (!variants.length || ctx.body instanceof Stream) {
    return;
  }

  const matching = variants.filter((variant) => {
    return variant.status === ctx.status;
  });
  if (!matching.length) {
    throw new Error(`${ctx.method} ${ctx.routerPath} responded ${ctx.status}, which is not documented.`);
  }

  const schemas = matching.map((variant) => variant.schema).filter(Boolean);
  if (matching.length > schemas.length) {
    return;
  }

  const body = serializeObject(ctx.body, ctx);
  const messages = [];
  for (let schema of schemas) {
    try {
      await schema.validate(body, { stripUnknown: true });
      return;
    } catch (error) {
      messages.push(error.getFullMessage?.() || error.message);
    }
  }
  throw new Error(
    `${ctx.method} ${ctx.routerPath} ${ctx.status} does not match its documentation: ${messages.join(' | ')}`,
  );
}

export default { include, description, success, error };

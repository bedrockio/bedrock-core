const Joi = require('@hapi/joi');

function validate(schemas, options) {
  const defaultOptions = {
    allowUnknown: false,
    abortEarly: false
  };

  return async function Validate(ctx, next) {
    Object.keys(schemas).forEach((key) => {
      const schema = schemas[key];
      const requestItem = ctx.request[key];
      ctx.request[`_${key}`] = requestItem;

      if (!requestItem) {
        const error = new Error(`Specified schema key '${key}' does not exist in 'request' object`);
        error.meta = {
          request: ctx.request
        };
        ctx.throw(500, error);
      }

      Joi.validate(
        requestItem,
        schema,
        {
          ...defaultOptions,
          ...options
        },
        (err, validatedItem) => {
          if (err) {
            err.details = err.details.map((detail) => {
              //eslint-disable-line
              return {
                ...detail,
                meta: {
                  parsedValue: validatedItem[detail.path],
                  // Explicitly show it was not provided
                  providedValue: requestItem[detail.path] || null
                }
              };
            });
            ctx.throw(400, err);
          }

          const jSchema = schema.isJoi ? schema : Joi.object(schema);

          const unverifiedParams = Object.keys(validatedItem || {}).filter((param) => !Joi.reach(jSchema, param));
          unverifiedParams.map((param) => delete validatedItem[param]); //eslint-disable-line

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

          if (key === 'query') {
            const originalQueryGetter = ctx.request.query;
            const src = {
              get orginalQuery() {
                return originalQueryGetter;
              },
              get query() {
                // https://github.com/koajs/koa/blob/9cef2db87e3066759afb9f002790cc24677cc913/lib/request.js#L168
                if (!this._querycache && Object.keys(validatedItem || {}).length) {
                  return validatedItem;
                }

                return this._querycache && this._querycache[this.querystring] ? validatedItem : originalQueryGetter;
              }
            };

            Object.getOwnPropertyNames(src).forEach((name) => {
              const descriptor = Object.getOwnPropertyDescriptor(src, name);
              Object.defineProperty(ctx.request, name, descriptor);
            });
          } else {
            ctx.request[key] = validatedItem;
          }
        }
      );
    });
    return next();
  };
}

function validateDocs(schemas) {
  const convert = require('joi-to-json-schema'); // eslint-disable-line
  return async function ValidateDocs(ctx, next) {
    const result = {};
    Object.keys(schemas).forEach((key) => {
      const schema = schemas[key];
      const jSchema = schema.isJoi ? schema : Joi.object(schema);
      try {
        result[key] = convert(jSchema);
      } catch (e) {
        console.error(e);
      }
    });
    ctx.state.validation = result;
    return next();
  };
}

module.exports = process.env.DOCS ? validateDocs : validate;

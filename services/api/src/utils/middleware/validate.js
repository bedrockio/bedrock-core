function validate(schemas, options) {
  const defaultOptions = {
    allowUnknown: false,
    abortEarly: false,
  };

  const promise = async function Validate(ctx, next) {
    Object.keys(schemas).forEach((key) => {
      const schema = schemas[key];

      const requestItem = ctx.request[key];
      ctx.request[`_${key}`] = requestItem;

      if (!requestItem) {
        const error = new Error(`Specified schema key '${key}' does not exist in 'request' object`);
        error.meta = {
          request: ctx.request,
        };
        ctx.throw(500, error);
      }

      const { value, error } = schema.validate(requestItem, { ...defaultOptions, ...options });

      if (error) {
        error.details = error.details.map((detail) => {
          //eslint-disable-line
          return {
            ...detail,
            meta: {
              parsedValue: value[detail.path],
              // Explicitly show it was not provided
              providedValue: requestItem[detail.path] || null,
            },
          };
        });
        ctx.throw(400, error);
      }

      const unverifiedParams = Object.keys(value || {}).filter((param) => !schema.extract(param));
      unverifiedParams.map((param) => delete value[param]); //eslint-disable-line

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
      } else {
        ctx.request[key] = value;
      }
    });
    return next();
  };

  promise.schemas = schemas;
  return promise;
}

module.exports = validate;

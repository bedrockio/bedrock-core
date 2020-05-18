
const fs = require('fs')
const { convert } = require('@yeongjet/joi-to-json-schema');

function templateGet(p, obj) {
  return p.split('.').reduce((res, key) => {
    const r = res[key];
    if (typeof r === 'undefined') {
      throw Error(`template: was not provided a value for attribute $${key}`);
    }
    return r;
  }, obj);
}

exports.template = (template, map) => {
  return template.replace(/\$\{.+?}/g, (match) => {
    const p = match.substr(2, match.length - 3).trim();
    return templateGet(p, map);
  });
};

exports.sleep = (ms) => {
  return new Promise((r) => setTimeout(r, ms));
};

function getParamsFromValidationMiddleware(validationMiddleware, type) {
  try {
    const params = []
    const { schemas } = validationMiddleware
    const schema = schemas[type]
    if (!schema) return [];
    const jsonSchema = convert(schema);
    const { properties, required } = jsonSchema
    Object.keys(properties).forEach((name) => {
      params.push({
        name,
        description: "",
        required: (required || []).includes(name),
        schema: properties[name]
      })
    });
    return params
  } catch (error) {
    console.warn(`Warning could not convert Joi validation to JSON: ${error.message}`);
    return []
  }
}

exports.routerToOpenApi = (router) => {
  const { stack } = router
  const paths = stack
    .filter(layer => layer.methods.length > 0)
    .map(layer => {
      const { methods, path } = layer
      let [method] = methods
      if (methods.includes('HEAD')) {
        method = 'GET'
      }
      const definition = {
        method,
        path
      }
      const validationMiddleware = layer.stack.find(layer => !!layer.schemas)
      if (validationMiddleware) {
        const query = getParamsFromValidationMiddleware(validationMiddleware, 'query')
        if (query && query.length) {
          definition.requestQuery = query
        }
        const body = getParamsFromValidationMiddleware(validationMiddleware, 'body')
        if (body && body.length) {
          definition.requestBody = body
        }
      }
      definition.responseBody = []
      definition.examples = []
      return definition
    })
  return {
    paths
  }
}

exports.loadOpenApiDefinitions = (dir, rootPath) => {
  return fs.readdirSync(dir)
    .filter(path => path.match('.json'))
    .map(path => {
      const routerName = path.replace('.json', '')
      const routerDefinition = JSON.parse(fs.readFileSync(`${dir}/${path}`).toString())
      return {
        name: routerName,
        paths: routerDefinition.paths.map(definition => {
          let definitionPath = definition.path
          if (definitionPath.slice(-1) === '/') {
            definitionPath = definitionPath.slice(0, -1)
          }
          definition.path = `${rootPath}/${routerName}${definitionPath}`
          return definition
        }),
        objects: routerDefinition.objects
      }
    })

}
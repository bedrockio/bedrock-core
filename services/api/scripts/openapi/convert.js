function getParameters(methodRoute) {
  const parameters = [];

  if (methodRoute.validation && methodRoute.validation.query) {
    // console.log(methodRoute.validation.query);
  }

  if (methodRoute.paramNames) {
    methodRoute.paramNames.forEach((paramName) => {
      parameters.push({
        name: paramName.name,
        in: 'path',
        required: true,
        schema: {
          type: 'string'
        }
      });
    });
  }

  return parameters.length ? parameters : null;
}

function getRequestBody(methodRoute) {
  if (!methodRoute.validation || !methodRoute.validation.body) {
    return null;
  }

  return {
    required: true,
    content: {
      'application/json': {
        schema: methodRoute.validation.body
      }
    }
  };
}

function getResponses(methodRoute) {
  const responses = {};
  (methodRoute.responses || []).forEach((response) => {
    if (response.status < 300 && response.status >= 200) {
      if (response.status === 204) {
        responses[response.status] = {
          description: 'success'
        };
        return;
      }
      responses[response.status.toString()] = {
        content: {
          'application/json': {
            ...(response.body
              ? {
                  examples: {
                    default: {
                      value: response.body
                    }
                  }
                }
              : {})
          }
        }
      };
    }
  });

  methodRoute.errors.forEach((error) => {
    responses[error.status] = {
      description: error.description
    };
  });
  return responses;
}

function getSummary(route) {
  const split = route.path.split('/').filter(Boolean);
  const tag = split[1];
  const method = route.method.toLowerCase();

  if (method === 'post' && split[split.length - 1] === 'search') {
    return `Search ${tag.replace(/s$/, '')}`;
  }

  if (method === 'post') {
    return `Create ${tag.replace(/s$/, '')}`;
  }

  if (method === 'patch') {
    return `Update ${tag.replace(/s$/, '')}`;
  }

  if (method === 'put') {
    return `Update ${tag.replace(/s$/, '')}`;
  }

  if (method === 'get' && route.paramNames.length === 1) {
    return `Get ${tag.replace(/s$/, '')}`;
  } else if (method === 'get') {
    return `List ${tag}`;
  }

  if (method === 'delete') {
    return `Delete ${tag.replace(/s$/, '')}`;
  }
}

function getMethods(data, path) {
  const methodsResult = {};
  const pathsByRoute = data.filter((c) => c.path === path);

  pathsByRoute.forEach((route) => {
    const parameters = getParameters(route);
    const requestBody = getRequestBody(route);
    const responses = getResponses(route);
    if (parameters) {
      methodsResult.parameters = parameters;
    }
    methodsResult.operationId = `${route.method.toLowerCase()}${path.replace(/\//g, '-')}`;
    const tag = route.path.split('/').filter(Boolean)[1];

    methodsResult[route.method.toLowerCase()] = {
      summary: getSummary(route),
      ...(requestBody ? { requestBody } : {}),
      ...(responses ? { responses } : {}),
      tags: tag ? [tag] : []
    };
  });
  return methodsResult;
}

function getPaths(data) {
  const result = {};
  data.forEach((route) => {
    if (!result[route.path]) {
      result[route.path] = {
        ...getMethods(data, route.path)
      };
    }
  });
  return result;
}

module.exports = function(data) {
  const result = {
    openapi: '3.0.1',
    info: {
      title: 'Platform API',
      version: '2.0.0',
      description: 'description'
    },
    paths: getPaths(data)
  };
  return result;
};

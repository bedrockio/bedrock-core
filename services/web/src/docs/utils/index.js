export function expandRoute(route) {
  const [method, path] = route.split(' ');
  return { method, path };
}

export function getSchemaPath(route) {
  const { method, path } = expandRoute(route);
  return [
    'paths',
    path,
    method.toLowerCase(),
    'requestBody',
    'content',
    'application/json',
    'schema',
  ];
}

export function getParametersPath(route) {
  const { method, path } = expandRoute(route);
  return ['paths', path, method.toLowerCase(), 'parameters'];
}

export function getRoutePath(route) {
  const { method, path } = expandRoute(route);
  return ['paths', path, method.toLowerCase()];
}

// TODO: needed??
export function getPropertiesPath(route) {
  return [...getSchemaPath(route), 'properties'];
}

export function expandRef($ref) {
  const split = $ref.split('/');
  return {
    name: split.at(-1),
    path: split.slice(1),
  };
}

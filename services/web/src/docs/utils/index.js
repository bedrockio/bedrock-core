import { get } from 'lodash';

export function expandRoute(route) {
  const [method, path] = route.split(' ');
  return { method, path };
}

export function getSchemaPath(route) {
  return [
    ...getRoutePath(route),
    'requestBody',
    'content',
    'application/json',
    'schema',
  ];
}

export function getParametersPath(route) {
  return [...getRoutePath(route), 'parameters'];
}

export function getPropertiesPath(route) {
  return [...getSchemaPath(route), 'properties'];
}

export function getRoutePath(route) {
  const { method, path } = expandRoute(route);
  return ['paths', path, method.toLowerCase()];
}

export function expandRef($ref) {
  const split = $ref.split('/');
  return {
    name: split.at(-1),
    path: split.slice(1),
  };
}

export function resolveRefs(docs, schema) {
  const { $ref } = schema;
  if ($ref) {
    const path = $ref.split('/').slice(1).join('.');
    return get(docs, path);
  } else {
    return schema;
  }
}

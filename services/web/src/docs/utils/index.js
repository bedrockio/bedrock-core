import { get } from 'lodash';

export function expandRoute(route) {
  const [method, path] = route.split(' ');
  return { method, path };
}

export function getSchemaPath(route, mime = 'application/json') {
  return [...getRoutePath(route), 'requestBody', 'content', mime, 'schema'];
}

export function getParametersPath(route) {
  return [...getRoutePath(route), 'parameters'];
}

export function getRequestBodyPath(route, mime) {
  return getSchemaPath(route, mime);
}

export function getModelPath(route) {
  return [...getRoutePath(route), 'x-model'];
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

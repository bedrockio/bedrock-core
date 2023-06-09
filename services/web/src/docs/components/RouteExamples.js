import React from 'react';
import { get } from 'lodash';

import { getRoutePath } from 'docs/utils';

import { DocsContext } from '../utils/context';

import RouteExample from './RouteExample';

export default class RouteExamples extends React.Component {
  static contextType = DocsContext;

  render() {
    const { docs } = this.context;
    if (!docs) {
      return null;
    }

    const routePath = getRoutePath(this.props.route);
    const routeData = get(docs, routePath);

    if (routeData) {
      const items = Object.entries(routeData.responses || {})
        .flatMap(([status, response]) => {
          return Object.entries(response.content || {}).flatMap(
            ([mimeType, entry]) => {
              const { schema, examples } = entry;
              if (schema?.$ref) {
                this.context.visitedComponents.add(schema.$ref);
              }
              const exampleResponses = Object.keys(examples || {}).map((id) => {
                const requestBody = get(docs, [
                  ...routePath,
                  'requestBody',
                  'content',
                  'application/json',
                  'examples',
                  id,
                  'value',
                ]);

                const examplePath = [
                  ...routePath,
                  'responses',
                  status,
                  'content',
                  mimeType,
                  'examples',
                  id,
                ];
                const responseBody = get(docs, [...examplePath, 'value']);
                const requestPath = get(docs, [...examplePath, 'x-path']);

                return {
                  status,
                  schema,
                  path: examplePath,
                  requestBody,
                  responseBody,
                  requestPath,
                };
              });
              if (exampleResponses.length) {
                return exampleResponses;
              } else {
                return [];
              }
            }
          );
        })
        .sort((a, b) => {
          return a.status < b.status;
        });
      if (items.length) {
        return (
          <React.Fragment>
            <h4>Examples:</h4>
            {items.map((item, i) => {
              return <RouteExample key={i} {...item} />;
            })}
          </React.Fragment>
        );
      }
    }
    return null;
  }
}

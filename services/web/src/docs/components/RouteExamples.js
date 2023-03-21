import React from 'react';
import { get } from 'lodash';

import { DocsContext } from '../utils/context';

import DocsExample from './DocsExample';

export default class RouteExamples extends React.Component {
  static contextType = DocsContext;

  getPath() {
    const [method, url] = this.props.route.split(' ');
    return ['paths', url, method.toLowerCase()];
  }

  render() {
    const path = this.getPath();
    const { docs } = this.context;
    if (!docs) {
      return null;
    }

    const item = get(docs, path);

    const items = Object.entries(item.responses || {})
      .flatMap(([status, response]) => {
        status = parseInt(status);
        const { schema, examples = {} } = get(
          response,
          ['content', 'application/json'],
          {}
        );
        if (schema?.$ref) {
          this.visitedComponents.add(schema.$ref);
        }
        const exampleResponses = Object.entries(examples).map(
          ([id, example]) => {
            const examples = get(
              item,
              ['requestBody', 'content', 'application/json', 'examples'],
              {}
            );
            return {
              status,
              schema,
              requestBody: examples[id]?.value,
              responseBody: example.value,
            };
          }
        );
        if (exampleResponses.length) {
          return exampleResponses;
        } else {
          return [
            {
              status,
              schema,
            },
          ];
        }
      })
      .sort((a, b) => {
        return a.status < b.status;
      });
    if (items.length) {
      return (
        <React.Fragment>
          <h4>Examples:</h4>
          {items.map((item, i) => {
            return <DocsExample key={i} item={item} />;
          })}
        </React.Fragment>
      );
    }
  }
}

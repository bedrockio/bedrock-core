import React from 'react';
import { get } from 'lodash';
import { Message } from 'semantic';

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

    const data = get(docs, getRoutePath(this.props.route));

    if (data) {
      const items = Object.entries(data.responses || {})
        .flatMap(([status, response]) => {
          status = parseInt(status);
          const { schema, examples = {} } = get(
            response,
            ['content', 'application/json'],
            {}
          );
          if (schema?.$ref) {
            this.context.visitedComponents.add(schema.$ref);
          }
          const exampleResponses = Object.entries(examples).map(
            ([id, example]) => {
              const examples = get(
                data,
                ['requestBody', 'content', 'application/json', 'examples'],
                {}
              );
              return {
                id,
                status,
                schema,
                path: example['x-path'],
                requestBody: examples[id]?.value,
                responseBody: example.value,
              };
            }
          );
          if (exampleResponses.length) {
            return exampleResponses;
          } else {
            return [];
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
              return (
                <RouteExample key={i} item={item} route={this.props.route} />
              );
            })}
          </React.Fragment>
        );
      }
    }
    return (
      <Message error>Cannot find examples for {this.props.route}.</Message>
    );
  }
}

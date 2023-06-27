import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic';
import { get } from 'lodash';

import {
  expandRoute,
  getRequestBodyPath,
  getParametersPath,
  getRoutePath,
  getModelPath,
} from 'docs/utils';

import { DocsContext } from '../utils/context';

import Properties from './Properties';

export default class RouteParams extends React.Component {
  static contextType = DocsContext;

  isSearchRoute() {
    const { method, path } = expandRoute(this.props.route);
    return method === 'POST' && path.endsWith('/search');
  }

  getRequestBody() {
    return (
      this.getRequestBodyForMime('application/json') ||
      this.getRequestBodyForMime('multipart/form-data')
    );
  }

  getRequestBodyForMime(mime) {
    const { route } = this.props;
    const { docs } = this.context;
    const path = getRequestBodyPath(route, mime);
    const entry = get(docs, path);
    if (entry) {
      return {
        path,
        entry,
        mime,
      };
    }
  }

  getQueryParams() {
    const { route } = this.props;
    const { docs } = this.context;
    const path = getParametersPath(route);
    const parameters = get(docs, path, []);

    let data;
    for (let parameter of parameters) {
      if (parameter.in === 'query') {
        const { name, schema } = parameter;
        data = {
          ...data,
          [name]: schema,
        };
      }
    }

    if (data) {
      return {
        data,
        getPath: (name) => {
          const index = parameters.findIndex((parameter) => {
            return parameter.name === name;
          });
          if (index === -1) {
            throw new Error('Query parameter not found.');
          }
          return [...path, index.toString()];
        },
      };
    }

    return data;
  }

  sortFields = (a, b, level) => {
    if (level === 0 && this.isSearchRoute()) {
      const aName = a[0];
      const bName = b[0];
      if (aName !== bName) {
        return aName === 'keyword' ? -1 : 1;
      }
    }
  };

  render() {
    const { route } = this.props;
    const { docs } = this.context;
    const model = get(docs, getModelPath(route));

    const routeEntry = get(docs, getRoutePath(route));
    const requestBody = this.getRequestBody();
    const queryParams = this.getQueryParams();

    if (!routeEntry) {
      return <Message error>No OpenApi entry found.</Message>;
    } else if (requestBody) {
      const { path, mime } = requestBody;
      return (
        <React.Fragment>
          <h4>Params:</h4>
          <Properties
            path={path}
            model={model}
            additionalSort={this.sortFields}
          />
          {this.renderMimeType(mime)}
        </React.Fragment>
      );
    } else if (queryParams) {
      const { data, getPath } = queryParams;
      return (
        <React.Fragment>
          <h4>Query Params:</h4>
          <Properties data={data} getPath={getPath} query />
        </React.Fragment>
      );
    } else {
      // Exists but no parameters.
      return null;
    }
  }

  renderMimeType(mime) {
    if (mime !== 'application/json') {
      return (
        <div style={{ marginTop: '1em ' }}>
          <b>Encoding</b>: <code>{mime}</code>
        </div>
      );
    }
  }
}

RouteParams.propTypes = {
  route: PropTypes.string.isRequired,
};

import { Alert } from '@mantine/core';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import {
  expandRoute,
  getModelPath,
  getParametersPath,
  getRequestBodyPath,
  getRoutePath,
} from 'docs/utils';

import Properties from './Properties';
import { DocsContext } from '../utils/context';

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
  }

  sortFields = (a, b, level) => {
    if (level === 0 && this.isSearchRoute()) {
      const aName = a[0];
      const bName = b[0];
      const rank = this.compareByRank(aName, bName);
      if (rank !== 0) {
        return rank;
      } else if (aName !== bName) {
        return aName === 'keyword' ? -1 : 1;
      }
    }
  };

  compareByRank(aName, bName) {
    const { sortFields = [] } = this.props;
    const aIndex = sortFields.indexOf(aName);
    const bIndex = sortFields.indexOf(bName);
    if (aIndex === bIndex) {
      return 0;
    } else if (aIndex === -1) {
      return 1;
    } else if (bIndex === -1) {
      return -1;
    } else {
      return aIndex - bIndex;
    }
  }

  render() {
    const { route, hideFields } = this.props;
    const { docs } = this.context;
    const model = get(docs, getModelPath(route));

    const routeEntry = get(docs, getRoutePath(route));
    const requestBody = this.getRequestBody();
    const queryParams = this.getQueryParams();

    if (!routeEntry) {
      return <Alert error>No OpenApi entry found.</Alert>;
    } else if (requestBody) {
      const { path, mime } = requestBody;
      return (
        <React.Fragment>
          <h4>Params:</h4>
          <Properties
            path={path}
            model={model}
            hideFields={hideFields}
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
  sortFields: PropTypes.arrayOf(PropTypes.string),
};

import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic';
import { get, isEmpty } from 'lodash';

import {
  expandRoute,
  getRequestBodyPath,
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

    const requestBodyPath = getRequestBodyPath(route);
    const requestBodyEntry = get(docs, requestBodyPath);

    if (!routeEntry) {
      return <Message error>No OpenApi entry found.</Message>;
    } else if (isEmpty(requestBodyEntry)) {
      // Exists but no parameters.
      return null;
    } else {
      return (
        <React.Fragment>
          <h4>Params:</h4>
          <Properties
            path={requestBodyPath}
            model={model}
            additionalSort={this.sortFields}
          />
        </React.Fragment>
      );
    }
  }
}

RouteParams.propTypes = {
  route: PropTypes.string.isRequired,
};

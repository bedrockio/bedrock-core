import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic';
import { get, isEmpty } from 'lodash';

import { getRequestBodyPath, getRoutePath, getModelPath } from 'docs/utils';

import { DocsContext } from '../utils/context';

import Properties from './Properties';

export default class RouteParams extends React.Component {
  static contextType = DocsContext;

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
          <Properties path={requestBodyPath} model={model} />
        </React.Fragment>
      );
    }
  }
}

RouteParams.propTypes = {
  route: PropTypes.string.isRequired,
};

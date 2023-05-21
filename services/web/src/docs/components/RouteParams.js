import React from 'react';
import PropTypes from 'prop-types';

import Properties from './Properties';

export default class RouteParams extends React.Component {
  getOpenApiPath() {
    const [method, url] = this.props.route.split(' ');
    return [
      'paths',
      url,
      method.toLowerCase(),
      'requestBody',
      'content',
      'application/json',
      'schema',
      'properties',
    ];
  }

  render() {
    return <Properties path={this.getOpenApiPath()} />;
  }
}

RouteParams.propTypes = {
  route: PropTypes.string.isRequired,
};

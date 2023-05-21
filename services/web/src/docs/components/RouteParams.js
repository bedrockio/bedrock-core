import React from 'react';
import PropTypes from 'prop-types';

import { getPropertiesPath } from 'docs/utils';

import Properties from './Properties';

export default class RouteParams extends React.Component {
  render() {
    return <Properties path={getPropertiesPath(this.props.route)} />;
  }
}

RouteParams.propTypes = {
  route: PropTypes.string.isRequired,
};

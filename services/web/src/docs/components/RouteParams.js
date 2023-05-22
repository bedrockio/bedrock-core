import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { getPropertiesPath, getModelPath } from 'docs/utils';

import { DocsContext } from '../utils/context';

import Properties from './Properties';

export default class RouteParams extends React.Component {
  static contextType = DocsContext;

  render() {
    const { route } = this.props;
    const { docs } = this.context;
    const path = getPropertiesPath(route);
    const model = get(docs, getModelPath(route));
    return <Properties path={path} model={model} />;
  }
}

RouteParams.propTypes = {
  route: PropTypes.string.isRequired,
};

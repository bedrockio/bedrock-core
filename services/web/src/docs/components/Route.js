import React from 'react';

import RouteAuthentication from './RouteAuthentication';
import RouteParams from './RouteParams';
import RoutePath from './RoutePath';
import RoutePermissions from './RoutePermissions';
import RouteResponse from './RouteResponse';

export default class Route extends React.Component {
  render() {
    return (
      <React.Fragment>
        <RoutePath {...this.props} />
        <RouteParams {...this.props} />
        <RouteAuthentication {...this.props} />
        <RoutePermissions {...this.props} />
        <RouteResponse {...this.props} />
      </React.Fragment>
    );
  }
}

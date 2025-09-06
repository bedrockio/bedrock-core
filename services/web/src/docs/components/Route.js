import React from 'react';

import RouteAuthentication from './RouteAuthentication';
import RouteExamples from './RouteExamples';
import RouteParams from './RouteParams';
import RoutePath from './RoutePath';
import RoutePermissions from './RoutePermissions';

export default class Route extends React.Component {
  render() {
    return (
      <React.Fragment>
        <RoutePath {...this.props} />
        <RouteParams {...this.props} />
        <RouteAuthentication {...this.props} />
        <RoutePermissions {...this.props} />
        <RouteExamples {...this.props} />
      </React.Fragment>
    );
  }
}

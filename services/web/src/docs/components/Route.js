import React from 'react';

import RoutePath from './RoutePath';
import RoutePermissions from './RoutePermissions';
import RouteAuthentication from './RouteAuthentication';
import RouteParams from './RouteParams';
import RouteExamples from './RouteExamples';

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

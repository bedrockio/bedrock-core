import React from 'react';

import RoutePath from './RoutePath';
import RouteAuth from './RouteAuth';
import RouteParams from './RouteParams';
import RouteExamples from './RouteExamples';

export default class Route extends React.Component {
  render() {
    return (
      <React.Fragment>
        <RoutePath {...this.props} />
        <RouteParams {...this.props} />
        <RouteAuth {...this.props} />
        <RouteExamples {...this.props} />
      </React.Fragment>
    );
  }
}

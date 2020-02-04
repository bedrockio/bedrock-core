import React from 'react';
import { defer } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { getCurrentLocaleCode } from 'utils/l10n/client';
import { Component } from 'common/helpers';
import { trackPage } from 'utils/analytics';
import { scrollToTop } from 'utils/helpers';

// TODO: how do we deal with metadata/contentful etc?
// TODO: this is starting to get brittle with having to
// call super for all lifecycle methods...see if we can
// refactor
export default class Screen extends Component {
  componentDidMount() {
    this.setupRouteEvents();
  }

  componentWillUnmount() {
    this.destroyRouteEvents();
  }

  // TODO: make this better
  _routeDidUpdate(type) {
    if (type === 'INIT') {
      // Need to defer here as react-helmet is async and
      // segment.io checks for a canonical link first.
      defer(trackPage, this.constructor.name);
    } else if (type === 'PUSH') {
      scrollToTop();
    }
  }

  render() {
    return (
      <React.Fragment>
        <Helmet>
          <html lang={getCurrentLocaleCode()} />
          {this.renderCanonical()}
        </Helmet>
        {this.renderBody()}
      </React.Fragment>
    );
  }

  renderCanonical() {
    return <link rel="canonical" href={location.href} />;
  }
}

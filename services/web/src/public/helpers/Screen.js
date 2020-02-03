import React from 'react';
import { defer } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { getCurrentLocaleCode } from 'utils/l10n/client';
import { trackPage } from 'utils/analytics';
import { Component } from 'common/helpers';

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
      this.scrollToTop();
    }
  }

  scrollToTop() {
    if (window.scrollY === 0) {
      return Promise.resolve();
    } else {
      return new Promise(function(resolve, reject) {
        // Some browsers will throw an error on scrollTo
        // when an options object is passed.
        try {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          });
          function onScroll() {
            if (window.scrollY === 0) {
              window.removeEventListener('scroll', onScroll);
              resolve();
            }
          }
          window.addEventListener('scroll', onScroll);
        } catch (err) {
          window.scrollTo(0, 0);
          resolve();
        }
      });
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

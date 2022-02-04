import React from 'react';
import { startCase } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'utils/env';
import { wrapComponent, getWrappedComponent } from 'utils/hoc';

import BasicLayout from 'layouts/Basic';
import DashboardLayout from 'layouts/Dashboard';

// Note: Ideally the screen helper would be agnostic to specific
// layouts and instead allow them to be defined by an app wiring
// them together, however react-hot-reloader has issues with this.
const layouts = {
  basic: BasicLayout,
  dashboard: DashboardLayout,
};

export default function (Component) {
  const Wrapped = getWrappedComponent(Component);
  const title = Wrapped.title || startCase(Wrapped.name.replace(/Screen$/, ''));
  const Layout =
    Wrapped.layout !== null && layouts[Wrapped.layout || 'dashboard'];

  if (!Layout && Wrapped.layout !== null) {
    throw new Error(`No layout "${Wrapped.layout}".`);
  }

  class Screen extends React.PureComponent {
    render() {
      return (
        <React.Fragment>
          <Helmet>
            {this.renderTitle()}
            {this.renderCanonical()}
          </Helmet>
          {Layout && (
            <Layout>
              <Component {...this.props} />
            </Layout>
          )}
          {!Layout && <Component {...this.props} />}
        </React.Fragment>
      );
    }

    renderTitle() {
      const parts = [];
      parts.push(Component.title || title);
      parts.push(APP_NAME);
      return <title>{parts.join(' | ')}</title>;
    }

    renderCanonical() {
      return <link rel="canonical" href={location.href} />;
    }
  }
  return wrapComponent(Component, Screen);
}

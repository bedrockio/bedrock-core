import React from 'react';
import { startCase } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'utils/env';
import bem from 'helpers/bem';

import DashboardLayout from 'layouts/Dashboard';
import PortalLayout from 'layouts/Portal';

const layouts = {
  portal: PortalLayout,
  dashboard: DashboardLayout,
};

export default function (Component) {
  const title = startCase(Component.name.replace(/Screen$/, ''));

  Component = bem(Component);
  const Layout = layouts[Component.layout || 'dashboard'] || nullLayout;

  return class Screen extends React.PureComponent {
    render() {
      return (
        <React.Fragment>
          <Helmet>
            {this.renderTitle()}
            {this.renderCanonical()}
          </Helmet>
          <Layout>
            <Component {...this.props} />
          </Layout>
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
  };
}

function nullLayout(props) {
  return props.children;
}

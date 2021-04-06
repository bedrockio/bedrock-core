import React from 'react';
import { startCase } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'utils/env';

import * as LAYOUTS from 'layouts';

function nullLayout(props) {
  return props.children;
}

export default function(Component) {

  const Layout = LAYOUTS[Component.layout || 'default'] || nullLayout;
  const title = startCase(Component.name.replace(/Screen$/, ''));

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

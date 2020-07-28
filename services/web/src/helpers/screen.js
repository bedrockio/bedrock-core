import React from 'react';
import { startCase } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from 'utils/env';

export default function(Component) {

  return class Screen extends React.PureComponent {

    render() {
      return (
        <React.Fragment>
          <Helmet>
            {this.renderTitle()}
            {this.renderCanonical()}
          </Helmet>
          <Component {...this.props} />
        </React.Fragment>
      );
    }

    renderTitle() {
      const parts = [];
      parts.push(Component.title || startCase(Component.name));
      parts.push(APP_NAME);
      return <title>{parts.join(' | ')}</title>;
    }

    renderCanonical() {
      return <link rel="canonical" href={location.href} />;
    }

  };
}

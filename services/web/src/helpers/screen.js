import React from 'react';
import { startCase } from 'lodash';

import MetaTitle from 'components/Meta/Title';
import MetaLocation from 'components/Meta/Location';

import { wrapComponent, getWrappedComponent } from 'utils/hoc';

export default function (Component) {
  const Wrapped = getWrappedComponent(Component);
  const title = Wrapped.title || startCase(Wrapped.name.replace(/Screen$/, ''));

  class Screen extends React.PureComponent {
    render() {
      return (
        <React.Fragment>
          <MetaLocation />
          <MetaTitle>{Component.title || title}</MetaTitle>
          <Component {...this.props} />
        </React.Fragment>
      );
    }
  }
  return wrapComponent(Component, Screen);
}

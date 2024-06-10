import React from 'react';
import { startCase } from 'lodash';

import Meta from 'components/Meta';

import { wrapComponent, getWrappedComponent } from 'utils/hoc';

export default function (Component) {
  const Wrapped = getWrappedComponent(Component);
  let title = Wrapped.title;
  title ||= startCase(Wrapped.name.replace(/Screen$/, ''));

  function Screen(props) {
    return (
      <React.Fragment>
        <Meta title={title} />
        <Component {...props} />
      </React.Fragment>
    );
  }

  return wrapComponent(Component, Screen);
}

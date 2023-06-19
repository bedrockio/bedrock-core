import React from 'react';

import { wrapComponent } from 'utils/hoc';

import PageCenter from 'components/PageCenter';
import ConnectionError from 'components/ConnectionError';

export default class BasicLayout extends React.Component {
  render() {
    return (
      <PageCenter>
        <ConnectionError />
        {this.props.children}
      </PageCenter>
    );
  }
}

export function withBasicLayout(Component) {
  class Wrapper extends React.PureComponent {
    render() {
      return (
        <BasicLayout>
          <Component {...this.props} />
        </BasicLayout>
      );
    }
  }
  return wrapComponent(Component, Wrapper);
}

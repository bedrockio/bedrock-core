import React from 'react';

import ConnectionError from 'components/ConnectionError';

export default class BasicLayout extends React.Component {
  render() {
    return (
      <div
        style={{
          height: '100vh',
        }}>
        <ConnectionError />
        {this.props.children}
      </div>
    );
  }
}

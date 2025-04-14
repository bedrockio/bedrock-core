import React from 'react';

import ConnectionError from 'components/ConnectionError';

export default class BasicLayout extends React.Component {
  render() {
    return (
      <div
        style={{
          height: '100vh',
          background:
            'linear-gradient(180deg, light-dark(var(--mantine-color-brown-1), transparent) 260px, light-dark(var(--mantine-color-gray-0), transparent) 30%, light-dark(var(--mantine-color-gray-0), transparent) 100%)',
        }}>
        <ConnectionError />
        {this.props.children}
      </div>
    );
  }
}

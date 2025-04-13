import React from 'react';

import { Icon } from 'semantic';

import { Code } from '@mantine/core';

import RequestBuilder from './RequestBuilder';

export default class Route extends React.Component {
  render() {
    const { route } = this.props;
    return (
      <Code
        action={
          <RequestBuilder route={route} trigger={<Icon name="play" link />} />
        }>
        {route}
      </Code>
    );
  }
}

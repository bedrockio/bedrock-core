import React from 'react';

import Code from 'components/Code';

import RequestBuilder from './RequestBuilder';
import { PiPlayFill } from 'react-icons/pi';
import { ActionIcon } from '@mantine/core';

export default class Route extends React.Component {
  render() {
    const { route } = this.props;
    return (
      <Code
        action={
          <RequestBuilder
            route={route}
            trigger={
              <ActionIcon variant="default">
                <PiPlayFill />
              </ActionIcon>
            }
          />
        }>
        {route}
      </Code>
    );
  }
}

import { ActionIcon } from '@mantine/core';
import React from 'react';
import { PiPlayFill } from 'react-icons/pi';

import Code from 'components/Code';

import RequestBuilder from './RequestBuilder';

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

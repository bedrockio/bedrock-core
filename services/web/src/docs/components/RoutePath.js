import React from 'react';

import Code from 'components/Code';

import RequestBuilder from './RequestBuilder';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
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
                <IconPlayerPlayFilled size={14} />
              </ActionIcon>
            }
          />
        }>
        {route}
      </Code>
    );
  }
}

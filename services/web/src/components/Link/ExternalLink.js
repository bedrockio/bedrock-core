import { Anchor } from '@mantine/core';
import React from 'react';

import { PiArrowSquareOutFill } from 'react-icons/pi';

export default class ExternalLink extends React.Component {
  render() {
    const { href, children, icon, ...rest } = this.props;
    return (
      <Anchor
        component="a"
        href={href}
        target="_blank"
        rel="external noopener noreferrer"
        {...rest}>
        {icon && <PiArrowSquareOutFill />}
        {children || href}
      </Anchor>
    );
  }
}

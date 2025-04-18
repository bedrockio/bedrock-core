import { Anchor } from '@mantine/core';
import React from 'react';

import { IconExternalLink } from '@tabler/icons-react';

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
        {icon && <IconExternalLink size={14} />}
        {children || href}
      </Anchor>
    );
  }
}

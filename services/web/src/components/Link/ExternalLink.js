import React from 'react';
import { Icon } from 'semantic';

export default class ExternalLink extends React.Component {
  render() {
    const { href, children, icon, ...rest } = this.props;
    return (
      <a
        href={href}
        target="_blank"
        rel="external noopener noreferrer"
        {...rest}>
        {icon && <Icon name="external-link-alt" />}
        {children || href}
      </a>
    );
  }
}

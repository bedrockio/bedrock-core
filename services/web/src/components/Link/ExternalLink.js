import React from 'react';
import { PiArrowSquareOutBold } from 'react-icons/pi';

import { cn } from '@/lib/utils';

export default class ExternalLink extends React.Component {
  render() {
    const { href, children, icon, className, ...rest } = this.props;
    return (
      <a
        href={href}
        target="_blank"
        rel="external noopener noreferrer"
        className={cn(
          'text-foreground no-underline hover:underline',
          className,
        )}
        {...rest}>
        {icon && <PiArrowSquareOutBold />}
        {children || href}
      </a>
    );
  }
}

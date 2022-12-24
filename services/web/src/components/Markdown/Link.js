import React from 'react';

import { ContentLink } from 'components/Link';

export default class LinkNode extends React.Component {
  render() {
    const { href, children } = this.props;
    return <ContentLink href={href}>{children}</ContentLink>;
  }
}

import React from 'react';
import ExternalLink from './ExternalLink';

export default class MailLink extends React.Component {

  render() {
    const { mail, ...props } = this.props;
    return (
      <ExternalLink
        {...props}
        rel="external"
        href={`mailto:${this.props.mail}`}>
        {this.props.children || mail}
      </ExternalLink>
    );
  }

}

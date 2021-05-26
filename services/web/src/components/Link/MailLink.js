import React from 'react';
import ExternalLink from './ExternalLink';

// Note here that tel/mailto links can be finicky on mobile about
// opening and should have rel="external" and NOT "noopener noreferer".
// https://www.telerik.com/forums/proper-way-to-do-mailto-and-tel-links

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

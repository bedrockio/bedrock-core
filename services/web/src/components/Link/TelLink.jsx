import React from 'react';
import ExternalLink from './ExternalLink';

// Note here that tel/mailto links can be finicky on mobile about
// opening and should have rel="external" and NOT "noopener noreferer".
// https://www.telerik.com/forums/proper-way-to-do-mailto-and-tel-links

export default class TelLink extends React.Component {
  static FORMAT_REG = /[-()\s]/g;

  render() {
    const { tel, ...props } = this.props;
    return (
      <ExternalLink
        {...props}
        rel="external"
        href={`tel:${this.props.tel.replace(TelLink.FORMAT_REG, '')}`}>
        {this.props.children || tel}
      </ExternalLink>
    );
  }
}

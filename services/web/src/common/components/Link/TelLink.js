import React from 'react';
import ExternalLink from './ExternalLink';

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

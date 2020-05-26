import React from 'react';

export default class ExternalLink extends React.Component {

  render() {
    return (
      <a
        target="_blank"
        rel="external noopener noreferrer"
        {...this.props}>
        {this.props.children || this.props.href}
      </a>
    );
  }

}


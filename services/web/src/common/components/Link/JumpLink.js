import React from 'react';
import { HashLink } from 'react-router-hash-link';

export default class JumpLink extends React.Component {

  render() {
    const { hash, ...props } = this.props;
    return <HashLink to={hash} {...props} smooth />;
  }

}

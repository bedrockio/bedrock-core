import React from 'react';
import { memoize, debounce } from 'lodash';

import './jump-link.less';

class JumpTarget extends React.Component {
  render() {
    const { id, children } = this.props;
    return (
      <React.Fragment>
        <div id={id} className="jump-target" />
        {this.props.children}
      </React.Fragment>
    );
  }
}

class JumpLink extends React.Component {
  static Target = JumpTarget;

  render() {
    const { to, ...rest } = this.props;
    return <a href={`#${to}`} {...rest} />;
  }
}

export default JumpLink;

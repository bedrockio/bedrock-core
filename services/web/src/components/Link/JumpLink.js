import React from 'react';
import ScrollWaypoint from '../ScrollWaypoint';

import './jump-link.less';

class JumpTarget extends React.Component {
  onScrollEnter = () => {
    this.toggleLinkActive(true);
  }

  onScrollLeave = () => {
    this.toggleLinkActive(false);
  }

  toggleLinkActive = (toggle) => {
    const { id } = this.props;
    const els = document.querySelectorAll(`[href^="#${id}"`);
    for (let el of els) {
      el.classList.toggle('jump-link--active', toggle);
    }
  }

  render() {
    const { id, children } = this.props;
    return (
      <ScrollWaypoint onEnter={this.onScrollEnter} onLeave={this.onScrollLeave}>
        <div id={id} className="jump-target" />
        {children}
      </ScrollWaypoint>
    );
  }
}

class JumpLink extends React.Component {
  static Target = JumpTarget;

  render() {
    const { to, className, ...rest } = this.props;
    const classes = className.split(' ');
    classes.push('jump-link');
    return <a href={`#${to}`} className={classes.join(' ')} {...rest} />;
  }
}

export default JumpLink;

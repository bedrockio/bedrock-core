import React from 'react';
import { CSSTransition } from 'react-transition-group';

export default class Transition extends React.Component {

  render() {
    // Flipping the in prop below as it's more intuitive
    // for fade in/out transitions and also issues with
    // mounted components and "appear".
    const classNames = this.props.children.props.className;
    return (
      <CSSTransition
        {...this.props}
        appear={true}
        classNames={classNames}
        addEndListener={this.addEndListener}
        in={!this.props.in}>
        {this.props.children}
      </CSSTransition>
    );
  }

  addEndListener = (node, done) => {
    node.addEventListener('transitionend', evt => {
      evt.stopPropagation();
      done();
    }, false);
  }

}

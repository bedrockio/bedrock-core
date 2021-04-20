// This component provides a way to define a "sidebar" layout as defined
// as a vertical menu to the side of main content that either sits to the
// side or overlays the content on smaller screens.
//
// Note that Semantic UI's sidebar component always pushes or overlays content
// and so can't be used as a base layout component when the menu is always visible.

import React from 'react';
import { throttle } from 'lodash';
import PropTypes from 'prop-types';

import bem from 'helpers/bem';

import Menu from './Menu';
import Content from './Content';
import Trigger from './Trigger';

import './sidebar.less';

const BREAKPOINTS = {
  always: 0,
  tablet: 768,
  desktop: 1128,
};

const Context = React.createContext();

Menu.contextType = Context;
Content.contextType = Context;
Trigger.contextType = Context;

@bem
export default class SidebarLayout extends React.Component {
  static Menu = Menu;
  static Content = Content;
  static Trigger = Trigger;

  constructor(props) {
    super(props);
    this.state = {
      fixed: this.isFixed(),
      open: false,
    };
  }

  // Lifecycle

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  // Events

  onResize = throttle(() => {
    const fixed = this.isFixed();
    this.setState({
      fixed,
      open: fixed && this.state.open,
    });
  }, 200);

  toggle = (open = !this.state.open) => {
    this.setState({
      open,
    });
  };

  close = () => {
    this.toggle(false);
  };

  // Other

  isFixed() {
    return window.innerWidth <= this.resolveBreakpoint();
  }

  resolveBreakpoint() {
    const { open } = this.props;
    return BREAKPOINTS[open] || open;
  }

  render() {
    return (
      <Context.Provider
        value={{ ...this.state, toggle: this.toggle, close: this.close }}>
        <div className={this.getBlockClass()}>{this.props.children}</div>
        {this.renderDimmer()}
      </Context.Provider>
    );
  }

  renderDimmer() {
    const { dimmer } = this.props;
    const { fixed, open } = this.state;
    if (dimmer && fixed) {
      return (
        <div className={this.getElementClass('dimmer', open ? 'open' : null)} />
      );
    }
  }
}

SidebarLayout.propTypes = {
  open: PropTypes.oneOfType([
    PropTypes.oneOf(['desktop', 'tablet', 'always']),
    PropTypes.number,
  ]),
  dimmer: PropTypes.bool,
};

SidebarLayout.defaultProps = {
  open: 'tablet',
  dimmer: true,
};

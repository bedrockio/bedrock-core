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
import Link from './Link';
import Item from './Item';
import Header from './Header';
import Mobile from './Mobile';
import Content from './Content';
import Trigger from './Trigger';
import Divider from './Divider';
import Accordion from './Accordion';

import './sidebar.less';

const BREAKPOINTS = {
  always: 0,
  tablet: 768,
  desktop: 1128,
};

const Context = React.createContext();

Menu.contextType = Context;
Link.contextType = Context;
Header.contextType = Context;
Mobile.contextType = Context;
Content.contextType = Context;
Trigger.contextType = Context;
Divider.contextType = Context;
Accordion.contextType = Context;

@bem
export default class SidebarLayout extends React.Component {
  static Menu = Menu;
  static Link = Link;
  static Item = Item;
  static Header = Header;
  static Mobile = Mobile;
  static Content = Content;
  static Trigger = Trigger;
  static Divider = Divider;
  static Accordion = Accordion;

  constructor(props) {
    super(props);
    this.state = {
      offscreen: this.isOffscreen(),
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
    const offscreen = this.isOffscreen();
    this.setState({
      offscreen,
      open: offscreen && this.state.open,
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

  isOffscreen() {
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
    const { offscreen, open } = this.state;
    if (dimmer && offscreen) {
      return (
        <div
          className={this.getElementClass('dimmer', open ? 'open' : null)}
          onClick={this.close}
        />
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

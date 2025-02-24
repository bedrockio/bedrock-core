// This component provides a way to define a "sidebar" layout as defined
// as a vertical menu to the side of main content that either sits to the
// side or overlays the content on smaller screens.
//
// Note that Semantic UI's sidebar component always pushes or overlays content
// and so can't be used as a base layout component when the menu is always visible.

import { useState, useEffect } from 'react';
import { throttle } from 'lodash';
import PropTypes from 'prop-types';

import { useClass } from 'helpers/bem';

import Menu from './Menu';
import Link from './Link';
import Item from './Item';
import Header from './Header';
import Mobile from './Mobile';
import Content from './Content';
import Trigger from './Trigger';
import Divider from './Divider';
import Accordion from './Accordion';

import { SidebarContext } from './context';

import './sidebar.less';

const BREAKPOINTS = {
  always: 0,
  tablet: 768,
  desktop: 1128,
};

export default function SidebarLayout(props) {
  const { dimmer } = props;

  const [open, setOpen] = useState(false);
  const [offscreen, setOffscreen] = useState(isOffscreen());

  const { className, getElementClass } = useClass('sidebar-layout');

  useEffect(() => {
    const onResize = throttle(() => {
      const offscreen = isOffscreen();
      setOffscreen(offscreen);
      setOpen(offscreen && open);
    }, 200);

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Events

  function toggle(next = !open) {
    setOpen(next);
  }

  function close() {
    setOpen(false);
  }

  // Other

  function isOffscreen() {
    return window.innerWidth <= resolveBreakpoint();
  }

  function resolveBreakpoint() {
    return BREAKPOINTS[props.open];
  }

  function render() {
    return (
      <SidebarContext.Provider value={{ open, offscreen, toggle, close }}>
        <div className={className}>{props.children}</div>
        {renderDimmer()}
      </SidebarContext.Provider>
    );
  }

  function renderDimmer() {
    if (dimmer && offscreen) {
      return (
        <div
          className={getElementClass('dimmer', open ? 'open' : null)}
          onClick={close}
        />
      );
    }
  }

  return render();
}

SidebarLayout.Menu = Menu;
SidebarLayout.Link = Link;
SidebarLayout.Item = Item;
SidebarLayout.Header = Header;
SidebarLayout.Mobile = Mobile;
SidebarLayout.Content = Content;
SidebarLayout.Trigger = Trigger;
SidebarLayout.Divider = Divider;
SidebarLayout.Accordion = Accordion;

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

import PropTypes from 'prop-types';

import { useClass } from 'helpers/bem';

import { useSidebar } from './context';

export default function SidebarLayoutMenu(props) {
  const { as: Component, dark, children } = props;
  const { offscreen, open } = useSidebar();

  function getModifiers() {
    return [
      dark ? 'dark' : null,
      open ? 'open' : null,
      offscreen ? 'offscreen' : null,
    ];
  }

  const { className } = useClass('sidebar-layout-menu', ...getModifiers());

  return <Component className={className}>{children}</Component>;
}

SidebarLayoutMenu.propTypes = {
  dark: PropTypes.bool,
  as: PropTypes.elementType,
};

SidebarLayoutMenu.defaultProps = {
  as: 'nav',
  dark: false,
};

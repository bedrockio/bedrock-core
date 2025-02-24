import PropTypes from 'prop-types';

import { useClass } from 'helpers/bem';

export default function SidebarLayoutDivider(props) {
  const { as: Component, ...rest } = props;
  const { className } = useClass('sidebar-layout-divider');
  return <Component className={className} {...rest} />;
}

SidebarLayoutDivider.propTypes = {
  as: PropTypes.elementType,
};

SidebarLayoutDivider.defaultProps = {
  as: 'div',
};

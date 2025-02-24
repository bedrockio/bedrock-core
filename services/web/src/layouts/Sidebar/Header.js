import PropTypes from 'prop-types';

import { useClass } from 'helpers/bem';

export default function SidebarLayoutHeader(props) {
  const { as: Component, ...rest } = props;
  const { className } = useClass('sidebar-layout-header');
  return <Component className={className} {...rest} />;
}

SidebarLayoutHeader.propTypes = {
  as: PropTypes.elementType,
};

SidebarLayoutHeader.defaultProps = {
  as: 'div',
};

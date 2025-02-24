import { NavLink } from '@bedrockio/router';

import { useClass } from 'helpers/bem';

export default function SidebarLayoutLink(props) {
  const { className } = useClass('sidebar-layout-link');
  return <NavLink className={className} {...props} />;
}

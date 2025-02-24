import { useClass } from 'helpers/bem';

export default function SidebarLayoutItem(props) {
  const { className } = useClass('sidebar-layout-item');
  return <div className={className} {...props} />;
}

import { useClass } from 'helpers/bem';

export default function SidebarLayoutMobile(props) {
  const { className } = useClass('sidebar-layout-mobile');
  return <div className={className}>{props.children}</div>;
}

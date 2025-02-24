import { useClass } from 'helpers/bem';

export default function SidebarLayoutAccordion(props) {
  const { children } = props;
  const active = location.pathname.startsWith(props.active);

  const { className } = useClass(
    'sidebar-layout-accordion',
    active ? 'active' : null
  );

  return <div className={className}>{children}</div>;
}

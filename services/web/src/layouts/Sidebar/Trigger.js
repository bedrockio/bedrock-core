import { useClass } from 'helpers/bem';

import { useSidebar } from './context';

export default function SidebarLayoutTrigger(props) {
  const { toggle } = useSidebar();

  function onClick(evt) {
    evt.stopPropagation();
    toggle();
  }

  const { className } = useClass('sidebar-layout-trigger');

  return (
    <div className={className} onClick={onClick}>
      {props.children}
    </div>
  );
}

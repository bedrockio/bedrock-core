import { useClass } from 'helpers/bem';

import { useSidebar } from './context';

export default function SidebarLayoutContent(props) {
  const { offscreen, close } = useSidebar();

  const { className } = useClass(
    'sidebar-layout-content',
    offscreen ? null : 'offset'
  );

  return (
    <div className={className} onClick={close}>
      {props.children}
    </div>
  );
}

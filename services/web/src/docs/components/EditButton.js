import { Icon } from 'semantic';

import { useClass } from 'helpers/bem';

import { useDocs } from '../utils/context';

export default function EditButton() {
  const { mode, setMode } = useDocs();
  const className = useClass('edit-button', mode === 'edit' ? 'active' : null);
  return (
    <Icon
      link
      name="pencil"
      title="Toggle Edit Mode"
      className={className}
      onClick={() => {
        setMode(mode === 'view' ? 'edit' : 'view');
      }}
    />
  );
}

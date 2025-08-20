import { useClass } from 'helpers/bem';

import { useDocs } from '../utils/context';
import { PiPencilSimpleFill } from 'react-icons/pi';
import { ActionIcon } from '@mantine/core';

export default function EditButton() {
  const { mode, setMode } = useDocs();
  const className = useClass('edit-button', mode === 'edit' ? 'active' : null);
  return (
    <ActionIcon
      variant="default"
      className={className}
      onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}>
      <PiPencilSimpleFill />
    </ActionIcon>
  );
}

import { useClass } from 'helpers/bem';

import { useDocs } from '../utils/context';
import { IconPencil } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';

export default function EditButton() {
  const { mode, setMode } = useDocs();
  const className = useClass('edit-button', mode === 'edit' ? 'active' : null);
  return (
    <ActionIcon
      variant="transparent"
      className={className}
      onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}>
      <IconPencil size={14} />
    </ActionIcon>
  );
}

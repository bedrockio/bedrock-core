import { PiPencilSimpleBold } from 'react-icons/pi';

import { Button } from '@/components/ui/button';

import { useClass } from 'helpers/bem';

import { useDocs } from '../utils/context';

export default function EditButton() {
  const { mode, setMode } = useDocs();
  const className = useClass('edit-button', mode === 'edit' ? 'active' : null);
  return (
    <Button
      variant="outline"
      size="icon"
      className={className}
      onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}>
      <PiPencilSimpleBold />
    </Button>
  );
}

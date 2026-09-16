import { useNavigate } from '@bedrockio/router';

import { Button } from '@/components/ui/button';

/**
 * Secondary dismiss for a form, sat next to the primary submit. Cancels back to
 * where the user came from (the list for a new object, the detail for an edit).
 * Pass `onClick` to override the destination.
 */
export default function CancelButton({ label = 'Cancel', onClick, className }) {
  const navigate = useNavigate();
  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      onClick={onClick || (() => navigate.back())}>
      {label}
    </Button>
  );
}

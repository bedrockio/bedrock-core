import { useNavigate } from '@bedrockio/router';

import { useUnsavedGuard } from 'components/UnsavedGuard';

import { Button } from '@/components/ui/button';

/**
 * Secondary dismiss for a form, sat next to the primary submit. Cancels back to
 * where the user came from (the list for a new object, the detail for an edit).
 * Pass `onClick` to override the destination. Routes through the unsaved-changes
 * guard, so a dirty form confirms before discarding input.
 */
export default function CancelButton({ label = 'Cancel', onClick, className }) {
  const navigate = useNavigate();
  const { guard } = useUnsavedGuard();
  const proceed = onClick || (() => navigate.back());
  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      onClick={() => guard(proceed)}>
      {label}
    </Button>
  );
}

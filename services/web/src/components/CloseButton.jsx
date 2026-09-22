import { useNavigate } from '@bedrockio/router';
import { X } from 'lucide-react';

import { useUnsavedGuard } from 'components/UnsavedGuard';

import { Button } from '@/components/ui/button';

/**
 * Dismiss control for page-based create/edit forms — a close (✕) icon that
 * returns to `to` (the list for a new object, the detail view for an edit).
 * Pages stand in for modals here, so the ✕ keeps that familiar close metaphor.
 * Routes through the unsaved-changes guard, so a dirty form confirms first.
 */
export default function CloseButton({ to, label = 'Close' }) {
  const navigate = useNavigate();
  const { guard } = useUnsavedGuard();
  return (
    <Button
      variant="outline"
      size="icon"
      title={label}
      aria-label={label}
      onClick={() => guard(() => navigate(to))}>
      <X />
    </Button>
  );
}

import { Link } from '@bedrockio/router';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * Dismiss control for page-based create/edit forms — a close (✕) icon that
 * returns to `to` (the list for a new object, the detail view for an edit).
 * Pages stand in for modals here, so the ✕ keeps that familiar close metaphor.
 */
export default function CloseButton({ to, label = 'Close' }) {
  return (
    <Button asChild variant="outline" size="icon" title={label} aria-label={label}>
      <Link to={to}>
        <X />
      </Link>
    </Button>
  );
}

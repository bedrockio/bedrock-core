import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

function Spinner({ className, ...props }) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn('text-muted-foreground size-4 animate-spin', className)}
      {...props}
    />
  );
}

export { Spinner };

import { ImageOff } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Image thumbnail that degrades to a neutral placeholder when the source fails
 * to load (e.g. an upload whose raw file isn't available), instead of showing
 * the browser's broken-image icon.
 */
export default function Thumbnail({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'bg-muted text-muted-foreground flex items-center justify-center rounded',
          className,
        )}>
        <ImageOff className="size-4" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn('rounded object-cover', className)}
      onError={() => setFailed(true)}
    />
  );
}

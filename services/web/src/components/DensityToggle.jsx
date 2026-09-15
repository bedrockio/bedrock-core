import * as React from 'react';

import { Switch } from '@/components/ui/switch';

/**
 * Global table density preference for operators, mirroring dark mode: sets
 * `data-density="compact"` on <html> and persists it. Comfortable is the
 * default (attribute absent); compact tightens table rows for scanning long
 * lists. globals.css reads the attribute.
 */
function applyDensity(compact) {
  const el = document.documentElement;
  if (compact) {
    el.dataset.density = 'compact';
  } else {
    delete el.dataset.density;
  }
}

export default function DensityToggle() {
  const [compact, setCompact] = React.useState(() => {
    try {
      return window.localStorage.getItem('density') === 'compact';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    applyDensity(compact);
  }, [compact]);

  function onToggle(checked) {
    setCompact(checked);
    try {
      window.localStorage.setItem('density', checked ? 'compact' : 'comfortable');
    } catch {
      // ignore (private mode / disabled storage)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs font-bold">Compact</span>
      <Switch
        checked={compact}
        onCheckedChange={onToggle}
        aria-label="Compact table rows"
      />
    </div>
  );
}

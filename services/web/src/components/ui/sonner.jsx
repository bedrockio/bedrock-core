import { Toaster as Sonner } from 'sonner';

import { useTheme } from '@/components/ThemeProvider';

function Toaster(props) {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      richColors
      position="bottom-right"
      style={{
        '--normal-bg': 'var(--popover)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
      }}
      {...props}
    />
  );
}

export { Toaster };

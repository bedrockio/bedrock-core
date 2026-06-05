import Logo from 'components/Logo';

import { useTheme } from '@/components/ThemeProvider';
import { Switch } from '@/components/ui/switch';

export default function Footer() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  function onToggle(checked) {
    setTheme(checked ? 'dark' : 'light');
  }

  return (
    <footer className="mt-4 flex items-center justify-end gap-6 py-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-bold">Theme</span>
        <Switch checked={isDark} onCheckedChange={onToggle} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-xs font-bold">
          Built with
        </span>
        <Logo width="120" height="18" />
      </div>
    </footer>
  );
}

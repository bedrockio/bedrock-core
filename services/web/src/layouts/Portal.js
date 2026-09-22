import { Link, useLocation } from '@bedrockio/router';
import { Menu } from 'lucide-react';
import { useEffect } from 'react';

import ConnectionError from 'components/ConnectionError';
import Logo from 'components/Logo';
import MenuItem from 'components/MenuItem';

import { useDisclosure } from 'hooks/useDisclosure';
import { useMediaQuery } from 'hooks/useMediaQuery';

import { Button } from '@/components/ui/button';

export default function PortalLayout({ children, menuItems, actions }) {
  const [opened, { toggle, close }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 48em)', false);

  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname]);

  const navbar = (
    <div className="bg-background flex h-full w-[220px] flex-col border-r">
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {menuItems.map((item) => (
          <MenuItem key={item.id} {...item} />
        ))}
      </nav>
      <div className="p-2">{actions}</div>
    </div>
  );

  return (
    <div className="bg-background flex min-h-screen w-full flex-col">
      <header className="flex h-[75px] items-center justify-between gap-4 border-b p-4">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle navigation"
              className="inline-flex size-9 cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent hover:bg-accent">
              <Menu className="size-5" />
            </button>
          )}
          <Logo height={35} />
        </div>
        <Button asChild>
          <Link to="/">Go to Dashboard</Link>
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        {!isMobile && (
          <aside className="sticky top-0 h-full shrink-0">{navbar}</aside>
        )}

        {isMobile && opened && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={close}
              aria-hidden="true"
            />
            <div className="relative z-10 h-full">{navbar}</div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4">
          <ConnectionError />
          {children}
        </main>
      </div>
    </div>
  );
}

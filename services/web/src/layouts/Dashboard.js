import { NavLink, useLocation } from '@bedrockio/router';
import { Building2, ChevronDown, Menu } from 'lucide-react';
import React, { useEffect } from 'react';

import {
  PiBookBold,
  PiBuildingOfficeBold,
  PiDoorBold,
  PiEnvelopeSimpleBold,
  PiFileBold,
  PiGearBold,
  PiGridFourBold,
  PiListMagnifyingGlass,
  PiStorefrontBold,
  PiTagBold,
  PiTerminalBold,
  PiUserBold,
} from 'react-icons/pi';

import { useSession } from 'stores/session';

import ConnectionError from 'components/ConnectionError';
import ErrorBoundary from 'components/ErrorBoundary';
import Footer from 'components/Footer';
import Logo from 'components/Logo';
import MenuItem from 'components/MenuItem';
import ModalTrigger from 'components/ModalWrapper';
import OrganizationSelector from 'components/OrganizationSelector';

import { useDisclosure } from 'hooks/useDisclosure';
import { useMediaQuery } from 'hooks/useMediaQuery';

import { userCanSwitchOrganizations } from 'utils/permissions';

import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: PiStorefrontBold, url: '/shops', label: 'Shops' },
  { icon: PiTagBold, url: '/products', label: 'Products' },
  {
    icon: PiUserBold,
    label: 'Users',
    url: '/users',
    items: [
      { icon: PiEnvelopeSimpleBold, label: 'Invites', url: '/users/invites' },
    ],
  },
  { icon: PiBuildingOfficeBold, url: '/organizations', label: 'Organizations' },
];

const accountItems = [
  {
    icon: PiTerminalBold,
    label: 'System',
    items: [
      { icon: PiFileBold, url: '/templates', label: 'Templates' },
      { icon: PiListMagnifyingGlass, url: '/audit-log', label: 'Audit Log' },
      { icon: PiGridFourBold, url: '/applications', label: 'Applications' },
      { icon: PiBookBold, url: '/docs', label: 'API Docs' },
    ],
  },
  { icon: PiGearBold, url: '/settings', label: 'My Settings' },
  { icon: PiDoorBold, url: '/logout', label: 'Log Out' },
];

export default function DashboardLayout({ children }) {
  const { user, organization } = useSession();
  const [opened, { toggle, close }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 62em)', false);
  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname]);

  const sidebar = (
    <div className="bg-sidebar text-sidebar-foreground border-sidebar-border flex h-full w-[260px] flex-col border-r">
      <div className="flex flex-col gap-1 p-2">
        <NavLink
          to="/"
          className="flex items-center justify-center py-2 no-underline">
          <Logo style={{ width: '100%', padding: '0.4em 0.8em' }} />
        </NavLink>
        {userCanSwitchOrganizations(user) && (
          <React.Fragment>
            <ModalTrigger
              title="Select Organization"
              trigger={
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 font-medium">
                  <Building2 className="size-4" />
                  <span className="flex-1 truncate text-left">
                    {organization?.name || 'Select Organization'}
                  </span>
                  <ChevronDown className="size-4 opacity-60" />
                </Button>
              }>
              <OrganizationSelector />
            </ModalTrigger>
            <div className="border-sidebar-border my-1 border-t" />
          </React.Fragment>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {menuItems.map((item) => (
          <MenuItem key={item.label} {...item} />
        ))}
      </nav>

      <nav className="border-sidebar-border flex flex-col gap-0.5 border-t p-2">
        {accountItems.map((item) => (
          <MenuItem key={item.label} {...item} />
        ))}
      </nav>
    </div>
  );

  return (
    <div className="bg-background flex min-h-screen w-full">
      {!isMobile && (
        <aside className="sticky top-0 h-screen shrink-0">{sidebar}</aside>
      )}

      {isMobile && opened && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={close}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {isMobile && (
          <header className="bg-sidebar border-sidebar-border sticky top-0 z-30 flex h-[50px] items-center gap-3 border-b px-4">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle navigation"
              className="text-sidebar-foreground inline-flex size-9 cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent hover:bg-sidebar-accent">
              <Menu className="size-5" />
            </button>
            <Logo height={20} />
          </header>
        )}

        <main className="flex flex-1 flex-col p-6">
          <div className="flex-1">
            <ConnectionError />
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}

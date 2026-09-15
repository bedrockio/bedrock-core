import { NavLink, useLocation } from '@bedrockio/router';
import {
  Book,
  Building2,
  ChevronsUpDown,
  Ellipsis,
  File,
  FileSearch,
  LayoutGrid,
  Mail,
  Menu,
  Store,
  Tag,
  User,
} from 'lucide-react';
import { useEffect } from 'react';

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

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navSections = [
  {
    label: 'Workspace',
    items: [
      { icon: Store, url: '/shops', label: 'Shops' },
      { icon: Tag, url: '/products', label: 'Products' },
      {
        icon: User,
        label: 'Users',
        url: '/users',
        items: [
          {
            icon: Mail,
            label: 'Invites',
            url: '/users/invites',
          },
        ],
      },
      {
        icon: Building2,
        url: '/organizations',
        label: 'Organizations',
      },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: File, url: '/templates', label: 'Templates' },
      { icon: FileSearch, url: '/audit-log', label: 'Audit Log' },
      { icon: LayoutGrid, url: '/applications', label: 'Applications' },
      { icon: Book, url: '/docs', label: 'API Docs' },
    ],
  },
];

function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function DashboardLayout({ children }) {
  const { user, organization } = useSession();
  const [opened, { toggle, close }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 62em)', false);
  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname]);

  const sidebar = (
    <div className="sidebar-soft text-sidebar-foreground border-sidebar-border flex h-full w-[264px] flex-col border-r">
      <div className="flex flex-col gap-2 p-3">
        <NavLink to="/" className="flex items-center px-1 py-1 no-underline">
          <Logo height={24} />
        </NavLink>
        {userCanSwitchOrganizations(user) && (
          <ModalTrigger
            title="Select Organization"
            trigger={
              <Button
                variant="outline"
                className="w-full justify-start gap-2 font-medium">
                <Building2 className="size-4 opacity-70" />
                <span className="flex-1 truncate text-left">
                  {organization?.name || 'Select Organization'}
                </span>
                <ChevronsUpDown className="size-4 opacity-60" />
              </Button>
            }>
            <OrganizationSelector />
          </ModalTrigger>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
        {navSections.map((section) => (
          <div key={section.label} className="flex flex-col gap-0.5">
            <div className="text-muted-foreground/80 px-3 pt-4 pb-1.5 text-xs font-semibold tracking-wider uppercase">
              {section.label}
            </div>
            {section.items.map((item) => (
              <MenuItem key={item.label} {...item} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-sidebar-border border-t p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-sidebar-accent flex w-full cursor-pointer appearance-none items-center gap-3 rounded-md border-0 bg-transparent px-2 py-2 text-left transition-colors">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {user?.name || 'Account'}
                </div>
                <div className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </div>
              </div>
              <Ellipsis className="size-4 shrink-0 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-[228px]">
            <DropdownMenuItem asChild>
              <NavLink to="/settings" className="no-underline">
                My Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/logout" className="no-underline">
                Log Out
              </NavLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="app-ground flex min-h-screen w-full">
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

import { NavLink, useLocation, useNavigate } from '@bedrockio/router';
import {
  Book,
  Building2,
  Check,
  Ellipsis,
  House,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  Monitor,
  Moon,
  PanelLeft,
  Settings,
  Store,
  Sun,
  Tag,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useSession } from 'stores/session';

import ConnectionError from 'components/ConnectionError';
import ErrorBoundary from 'components/ErrorBoundary';
import Logo from 'components/Logo';
import MenuItem from 'components/MenuItem';
import OrganizationSelector from 'components/OrganizationSelector';

import { useDisclosure } from 'hooks/useDisclosure';
import { useMediaQuery } from 'hooks/useMediaQuery';

import { userCanSwitchOrganizations } from 'utils/permissions';

import { useTheme } from '@/components/ThemeProvider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { APP_NAME } from 'utils/env';

import logoIcon from 'assets/logo-icon.svg';

const navSections = [
  {
    label: 'Workspace',
    items: [
      { icon: House, url: '/', label: 'Dashboard', exact: true },
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
    ],
  },
];

const SIDEBAR_COLLAPSED_KEY = 'sidebarCollapsed';

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
  const { user } = useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [opened, { toggle, close }] = useDisclosure();
  const isMobile = useMediaQuery('(max-width: 62em)', false);
  const location = useLocation();
  const drawerRef = useRef(null);

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // ignore (private mode / disabled storage)
      }
      return next;
    });
  }

  useEffect(() => {
    close();
  }, [location.pathname]);

  // Mobile drawer keyboard + focus contract: Escape closes it, focus moves in
  // on open and returns to the trigger on close, and Tab cycles within the
  // panel so keyboard users are never stranded behind the backdrop.
  useEffect(() => {
    if (!isMobile || !opened) {
      return;
    }

    const previouslyFocused = document.activeElement;
    const panel = drawerRef.current;
    const focusable = () =>
      panel
        ? Array.from(
            panel.querySelectorAll(
              'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];

    focusable()[0]?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusable();
        if (items.length === 0) {
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isMobile, opened, close]);

  function renderSidebar(isCollapsed, { showToggle = true } = {}) {
    return (
      <div
        className={cn(
          'sidebar-soft text-sidebar-foreground border-sidebar-border group flex h-full flex-col border-r transition-[width] duration-200',
          isCollapsed ? 'w-[72px]' : 'w-[264px]',
        )}>
        <div
          className={cn(
            'border-sidebar-border flex flex-col gap-3 border-b pt-4 pb-3',
            isCollapsed ? 'items-center px-2' : 'px-3',
          )}>
          {isCollapsed ? (
            <div className="relative mx-auto flex size-9 items-center justify-center">
              <NavLink
                to="/"
                aria-label={APP_NAME}
                className="absolute inset-0 flex items-center justify-center no-underline opacity-100 transition-opacity group-hover:pointer-events-none group-hover:opacity-0">
                <img src={logoIcon} alt={APP_NAME} className="size-6" />
              </NavLink>
              {showToggle && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleCollapsed}
                      aria-label="Expand sidebar"
                      className="hover:bg-sidebar-accent text-muted-foreground hover:text-foreground pointer-events-none absolute inset-0 inline-flex cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100">
                      <PanelLeft className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Expand sidebar</TooltipContent>
                </Tooltip>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <NavLink to="/" className="flex items-center px-2 no-underline">
                <Logo height={32} />
              </NavLink>
              {showToggle && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleCollapsed}
                      aria-label="Collapse sidebar"
                      className="hover:bg-sidebar-accent text-muted-foreground hover:text-foreground inline-flex size-7 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent transition-colors">
                      <PanelLeft className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Collapse sidebar</TooltipContent>
                </Tooltip>
              )}
            </div>
          )}
          {userCanSwitchOrganizations(user) && (
            <OrganizationSelector collapsed={isCollapsed} />
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
          {navSections.map((section) => (
            <div key={section.label} className="flex flex-col gap-0.5">
              {!isCollapsed && (
                <div className="text-muted-foreground px-3 pt-4 pb-1.5 text-xs font-semibold tracking-wider uppercase">
                  {section.label}
                </div>
              )}
              {isCollapsed && <div className="pt-2" />}
              {section.items.map((item) => (
                <MenuItem key={item.label} {...item} collapsed={isCollapsed} />
              ))}
            </div>
          ))}
        </nav>

        <div className="border-sidebar-border border-t p-2">
          <DropdownMenu>
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="hover:bg-sidebar-accent mx-auto flex size-9 cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent p-0 transition-colors">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {user?.name || 'Account'}
                </TooltipContent>
              </Tooltip>
            ) : (
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
            )}
            <DropdownMenuContent
              side={isCollapsed ? 'right' : 'top'}
              align="start"
              className="w-[240px]">
              <div className="px-2 py-1.5">
                <div className="truncate text-sm font-semibold">
                  {user?.name || 'Account'}
                </div>
                <div className="text-muted-foreground truncate text-xs">
                  {user?.email}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/settings')}>
                <Settings />
                My Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/organization')}>
                <Building2 />
                Organization Settings
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/organizations')}>
                <LayoutGrid />
                Organizations
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/docs')}>
                <Book />
                API Docs
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {theme === 'dark' ? (
                    <Moon />
                  ) : theme === 'light' ? (
                    <Sun />
                  ) : (
                    <Monitor />
                  )}
                  <div className="flex flex-col gap-0.5">
                    <span>Appearance</span>
                    <span className="text-muted-foreground text-xs">
                      {theme === 'system'
                        ? `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`
                        : theme === 'dark'
                          ? 'Dark'
                          : 'Light'}
                    </span>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onSelect={() => setTheme('light')}>
                    <Sun />
                    Light
                    {theme === 'light' && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTheme('dark')}>
                    <Moon />
                    Dark
                    {theme === 'dark' && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setTheme('system')}>
                    <Monitor />
                    System
                    {theme === 'system' && <Check className="ml-auto" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate('/logout')}>
                <LogOut />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="app-ground flex min-h-screen w-full">
      {!isMobile && (
        <aside className="sticky top-0 h-screen shrink-0">
          {renderSidebar(collapsed)}
        </aside>
      )}

      {isMobile && opened && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={close}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="relative z-10 h-full">
            {renderSidebar(false, { showToggle: false })}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {isMobile && (
          <header className="bg-sidebar border-sidebar-border sticky top-0 z-30 flex h-[50px] items-center justify-between border-b px-4">
            <Logo height={32} />
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle navigation"
              aria-expanded={opened}
              aria-controls="mobile-nav"
              className="text-sidebar-foreground inline-flex size-9 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent hover:bg-sidebar-accent">
              <Menu className="size-5" />
            </button>
          </header>
        )}

        <main className="flex flex-1 flex-col p-6">
          <ConnectionError />
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

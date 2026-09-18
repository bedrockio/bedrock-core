import { NavLink, useLocation } from '@bedrockio/router';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { ExternalLink } from './Link';

export default function MenuItem(props) {
  const {
    url,
    label,
    icon: Icon,
    items = [],
    exact,
    level = 1,
    collapsed = false,
  } = props;

  const isExternal = url?.startsWith('http');
  const hasItems = items.length > 0;
  const { pathname } = useLocation();

  const active = url
    ? exact
      ? pathname === url
      : pathname === url || pathname.startsWith(`${url}/`)
    : false;

  // A group is open when it (or one of its children) matches the current route.
  // Pure groups (no `url`, e.g. "System") have no route to match, so they rely
  // on the manual toggle below.
  const childActive =
    hasItems &&
    items.some(
      (item) =>
        item.url &&
        (pathname === item.url || pathname.startsWith(`${item.url}/`)),
    );
  const routeOpen = (url && pathname.startsWith(url)) || childActive;

  // A parent shouldn't highlight when one of its own child items is the actual
  // match (e.g. on /users/invites, "Invites" is active — not "Users").
  const isActive = active && !childActive;

  const [open, setOpen] = useState(routeOpen);
  useEffect(() => {
    if (routeOpen) setOpen(true);
  }, [routeOpen]);

  const [flyoutOpen, setFlyoutOpen] = useState(false);

  const itemClass = cn(
    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium no-underline transition-colors',
    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    isActive &&
      'bg-primary/12 text-primary hover:bg-primary/15 hover:text-primary',
    level > 1 && !collapsed && 'pl-9',
    collapsed && 'justify-center px-2',
  );

  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0" />}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {hasItems && (
            <ChevronRight
              className={cn(
                'size-4 transition-transform',
                open && 'rotate-90',
              )}
            />
          )}
        </>
      )}
    </>
  );

  function renderTrigger() {
    if (url && isExternal) {
      return (
        <ExternalLink href={url} className={itemClass}>
          {content}
        </ExternalLink>
      );
    }
    if (url) {
      return (
        <NavLink to={url} exact className={itemClass}>
          {content}
        </NavLink>
      );
    }
    // Pure group: clicking toggles its subtree.
    return (
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          itemClass,
          'cursor-pointer appearance-none border-0 bg-transparent',
        )}>
        {content}
      </button>
    );
  }

  // Collapsed + has children: the label and its own route still work on
  // click, but the sub-items can't render inline (no room), so hovering
  // reveals them in a portaled flyout next to the rail instead — a plain
  // CSS hover panel would get clipped by the nav's own overflow-y scroll
  // container, so this reuses the same Popover primitive as the rest of
  // the app's floating UI.
  if (collapsed && hasItems) {
    return (
      <Popover open={flyoutOpen} onOpenChange={setFlyoutOpen}>
        <PopoverTrigger asChild>
          <div
            onMouseEnter={() => setFlyoutOpen(true)}
            onMouseLeave={() => setFlyoutOpen(false)}>
            {renderTrigger()}
          </div>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-48 p-1.5"
          onMouseEnter={() => setFlyoutOpen(true)}
          onMouseLeave={() => setFlyoutOpen(false)}>
          <div className="text-muted-foreground px-2 pt-1 pb-1.5 text-xs font-semibold">
            {label}
          </div>
          {items.map((item) => (
            <MenuItem key={item.url || item.label} {...item} level={1} />
          ))}
        </PopoverContent>
      </Popover>
    );
  }

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{renderTrigger()}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      {renderTrigger()}
      {hasItems && open && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          {items.map((item) => (
            <MenuItem
              key={item.url || item.label}
              {...item}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

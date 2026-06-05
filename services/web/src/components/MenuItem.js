import { NavLink, useLocation } from '@bedrockio/router';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { ExternalLink } from './Link';

export default function MenuItem(props) {
  const { url, label, icon: Icon, items = [], exact, level = 1 } = props;

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
        item.url && (pathname === item.url || pathname.startsWith(`${item.url}/`)),
    );
  const routeOpen = (url && pathname.startsWith(url)) || childActive;

  const [open, setOpen] = useState(routeOpen);
  useEffect(() => {
    if (routeOpen) setOpen(true);
  }, [routeOpen]);

  const itemClass = cn(
    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium no-underline transition-colors',
    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    active && 'bg-sidebar-accent text-sidebar-accent-foreground',
    level > 1 && 'pl-9',
  );

  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0" />}
      <span className="flex-1 truncate">{label}</span>
      {hasItems && (
        <ChevronRight
          className={cn('size-4 transition-transform', open && 'rotate-90')}
        />
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
        className={cn(itemClass, 'cursor-pointer appearance-none border-0 bg-transparent')}>
        {content}
      </button>
    );
  }

  return (
    <div>
      {renderTrigger()}
      {hasItems && open && (
        <div className="mt-0.5 flex flex-col gap-0.5">
          {items.map((item) => (
            <MenuItem key={item.url || item.label} {...item} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

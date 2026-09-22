import { Link, NavLink, useLocation } from '@bedrockio/router';
import { Fragment } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

function isActive(section, pathname) {
  return section.exact
    ? pathname === section.url
    : pathname === section.url || pathname.startsWith(`${section.url}/`);
}

/**
 * Shared settings surface: a page-level breadcrumb above a persistent vertical
 * secondary nav (left) and the active section's content (right). Used by both
 * My Settings and Organization Settings so they read identically. Sections
 * render their own titles and actions; the breadcrumb lives here, once.
 *
 *   sections: [{ label, url, exact? }]  — `exact` marks a root/landing section
 *   title:    breadcrumb + nav heading  (e.g. "Settings")
 *   rootHref: where the title crumb links when a section is open
 */
export default function SettingsShell({ title, rootHref, sections, children }) {
  const { pathname } = useLocation();
  const current = sections.find((section) => isActive(section, pathname));
  const deeper = current && !current.exact;

  const crumbs = [
    { title: 'Home', href: '/' },
    deeper ? { title, href: rootHref } : { title },
  ];
  if (deeper) {
    crumbs.push(
      pathname === current.url
        ? { title: current.label }
        : { title: current.label, href: current.url },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, index) => (
            <Fragment key={index}>
              <BreadcrumbItem>
                {crumb.href ? (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.title}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < crumbs.length - 1 && (
                <BreadcrumbSeparator>/</BreadcrumbSeparator>
              )}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <nav className="flex shrink-0 flex-col gap-0.5 lg:w-56">
          <div className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
            {title}
          </div>
          {sections.map((section) => {
            const active = isActive(section, pathname);
            return (
              <NavLink
                key={section.url}
                to={section.url}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors',
                  active
                    ? 'bg-primary/12 text-primary'
                    : 'text-sidebar-foreground hover:bg-muted hover:text-foreground',
                )}>
                {section.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

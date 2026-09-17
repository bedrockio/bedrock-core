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

const SECTIONS = [
  { label: 'General', url: '/organization', exact: true },
  { label: 'Templates', url: '/organization/templates' },
  { label: 'Applications', url: '/organization/applications' },
  { label: 'Audit Log', url: '/organization/audit-log' },
  { label: 'API Docs', url: '/docs' },
];

function isActive(section, pathname) {
  return section.exact
    ? pathname === section.url
    : pathname === section.url || pathname.startsWith(`${section.url}/`);
}

/**
 * Organization Settings shell — a page-level breadcrumb above a persistent
 * vertical secondary nav (left) and the active section's content (right).
 * Houses the org-level admin areas that used to live in the sidebar's "System"
 * group. Sections render their own titles and actions; the breadcrumb lives
 * here, once, above the whole page.
 */
export default function OrganizationLayout({ children }) {
  const { pathname } = useLocation();
  const current = SECTIONS.find((section) => isActive(section, pathname));

  const crumbs = [
    { title: 'Home', href: '/' },
    { title: 'Organization Settings', href: '/organization' },
  ];
  if (current && !current.exact) {
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
            Organization
          </div>
          {SECTIONS.map((section) => {
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

import { NavLink, useLocation } from '@bedrockio/router';

import { cn } from '@/lib/utils';

const SECTIONS = [
  { label: 'General', url: '/organization', exact: true },
  { label: 'Templates', url: '/organization/templates' },
  { label: 'Applications', url: '/organization/applications' },
  { label: 'Audit Log', url: '/organization/audit-log' },
  { label: 'API Docs', url: '/docs' },
];

/**
 * Organization Settings shell — a persistent vertical secondary nav on the left
 * with the active section's content on the right. Houses the org-level admin
 * areas that used to live in the sidebar's "System" group.
 */
export default function OrganizationLayout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      <nav className="flex shrink-0 flex-col gap-0.5 lg:w-56">
        <div className="text-muted-foreground mb-2 px-3 text-xs font-semibold tracking-wider uppercase">
          Organization
        </div>
        {SECTIONS.map((section) => {
          const active = section.exact
            ? pathname === section.url
            : pathname === section.url || pathname.startsWith(`${section.url}/`);
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
  );
}

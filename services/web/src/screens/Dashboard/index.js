import { Link } from '@bedrockio/router';
import { ArrowRight, Building2, Store, Tag, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import Meta from 'components/Meta';

import { useSession } from 'stores/session';

import { request } from 'utils/api';
import { formatNumber } from 'utils/formatting';

const SECTIONS = [
  {
    label: 'Organizations',
    resource: 'organizations',
    url: '/organizations',
    icon: Building2,
  },
  { label: 'Shops', resource: 'shops', url: '/shops', icon: Store },
  { label: 'Products', resource: 'products', url: '/products', icon: Tag },
  { label: 'Users', resource: 'users', url: '/users', icon: Users },
];

export default function Dashboard() {
  const { user } = useSession();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let active = true;

    async function count(resource) {
      try {
        const { meta } = await request({
          method: 'POST',
          path: `/1/${resource}/search`,
          body: { limit: 1 },
        });
        return meta?.total ?? null;
      } catch {
        return null;
      }
    }

    (async () => {
      const entries = await Promise.all(
        SECTIONS.map(async (s) => [s.resource, await count(s.resource)]),
      );
      if (active) {
        setCounts(Object.fromEntries(entries));
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const fmt = (n) => (n == null ? '—' : formatNumber(n));
  const firstName = (user?.name || '').trim().split(' ')[0];

  return (
    <div className="flex flex-col gap-6">
      <Meta title="Dashboard" />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your operations at a glance.
        </p>
      </div>

      <div>
        <div className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
          Manage
        </div>
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.resource}
                to={s.url}
                className="card-soft group rounded-2xl p-5 no-underline transition-shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                    <Icon className="size-5" />
                  </span>
                  <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="mt-3 font-mono text-xl font-bold tabular-nums">
                  {fmt(counts[s.resource])}
                </div>
                <div className="text-foreground text-sm font-semibold">
                  {s.label}
                </div>
                <div className="text-muted-foreground text-xs">
                  Manage {s.label.toLowerCase()}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

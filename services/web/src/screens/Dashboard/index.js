import { Link } from '@bedrockio/router';
import { ArrowRight, Clock, Star, Store, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

import PageHeader from 'components/PageHeader';
import { StatCard, StatGrid } from 'components/StatCard';

import { useSession } from 'stores/session';

import { request } from 'utils/api';
import { formatNumber } from 'utils/formatting';

// Catalog price bands (priceUsd is stored in whole dollars).
const PRICE_BANDS = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25–$50', min: 25, max: 50 },
  { label: '$50–$100', min: 50, max: 100 },
  { label: '$100–$250', min: 100, max: 250 },
  { label: '$250+', min: 250, max: Infinity },
];

export default function Dashboard() {
  const { user } = useSession();
  const [stats, setStats] = useState(null);
  const [bands, setBands] = useState(null);

  useEffect(() => {
    let active = true;

    // Exact count via search meta.total — cheap, scalable, no item payload.
    async function total(resource, body = {}) {
      try {
        const { meta } = await request({
          method: 'POST',
          path: `/1/${resource}/search`,
          body: { ...body, limit: 1 },
        });
        return meta?.total ?? null;
      } catch {
        return null;
      }
    }

    // Price distribution from a bounded product sample, bucketed client-side.
    async function loadBands() {
      try {
        const { data } = await request({
          method: 'POST',
          path: '/1/products/search',
          body: { limit: 1000 },
        });
        return PRICE_BANDS.map((b) => ({
          label: b.label,
          count: data.filter(
            (p) =>
              typeof p.priceUsd === 'number' &&
              p.priceUsd >= b.min &&
              p.priceUsd < b.max,
          ).length,
        }));
      } catch {
        return null;
      }
    }

    (async () => {
      const nowIso = new Date().toISOString();
      const in30Iso = new Date(Date.now() + 30 * 864e5).toISOString();
      const [products, shops, featured, expiring, bandData] = await Promise.all([
        total('products'),
        total('shops'),
        total('products', { isFeatured: true }),
        total('products', { expiresAt: { gte: nowIso, lte: in30Iso } }),
        loadBands(),
      ]);
      if (active) {
        setStats({ products, shops, featured, expiring });
        setBands(bandData);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const fmt = (n) => (n == null ? '—' : formatNumber(n));
  const firstName = (user?.name || '').trim().split(' ')[0];
  const featuredPct =
    stats?.featured != null && stats?.products
      ? Math.round((stats.featured / stats.products) * 100)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        breadcrumbItems={[{ href: '/', title: 'Home' }, { title: 'Dashboard' }]}
      />
      <p className="text-muted-foreground -mt-3 text-sm">
        {firstName ? `Welcome back, ${firstName}. ` : 'Welcome back. '}
        Here's your catalog at a glance.
      </p>

      <StatGrid>
        <NavStat
          label="Products"
          value={fmt(stats?.products)}
          hint="in catalog"
          icon={Tag}
          to="/products"
        />
        <NavStat
          label="Shops"
          value={fmt(stats?.shops)}
          hint="storefronts"
          icon={Store}
          to="/shops"
        />
        <StatCard
          label="Featured"
          value={fmt(stats?.featured)}
          hint={featuredPct == null ? 'promoted' : `${featuredPct}% of catalog`}
          icon={Star}
        />
        <StatCard
          label="Expiring soon"
          value={fmt(stats?.expiring)}
          hint="next 30 days"
          icon={Clock}
        />
      </StatGrid>

      <div className="card-soft rounded-2xl p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-base font-semibold">Catalog by price</h2>
          <span className="text-muted-foreground text-xs tabular-nums">
            {bands
              ? `${fmt(bands.reduce((s, b) => s + b.count, 0))} priced products`
              : ''}
          </span>
        </div>
        <div className="mt-5">
          <PriceBandChart bands={bands} />
        </div>
      </div>
    </div>
  );
}

/** A KPI card that drills into its section — label, big figure, drill arrow. */
function NavStat({ label, value, hint, icon: Icon, to }) {
  return (
    <Link
      to={to}
      aria-label={`View ${label}`}
      className="card-soft group rounded-2xl p-4 no-underline transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        <span className="text-muted-foreground flex items-center gap-1">
          <Icon className="size-4" />
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="mt-2 font-mono text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="text-muted-foreground mt-1 text-xs font-medium">{hint}</div>
    </Link>
  );
}

/** Horizontal bar distribution of the catalog across price bands. */
function PriceBandChart({ bands }) {
  if (!bands) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="bg-muted h-3 w-20 shrink-0 rounded" />
            <div className="bg-muted h-7 flex-1 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const totalCount = bands.reduce((s, b) => s + b.count, 0);
  if (totalCount === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No priced products yet — add prices to your products to see their spread.
      </p>
    );
  }

  const max = Math.max(1, ...bands.map((b) => b.count));
  return (
    <div className="flex flex-col gap-3">
      {bands.map((b) => (
        <div key={b.label} className="flex items-center gap-3">
          <span className="text-muted-foreground w-20 shrink-0 text-xs font-medium">
            {b.label}
          </span>
          <div className="bg-muted relative h-7 flex-1 overflow-hidden rounded-md">
            <div
              className="bg-primary/85 h-full rounded-md transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max((b.count / max) * 100, b.count ? 4 : 0)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-mono text-sm tabular-nums">
            {b.count}
          </span>
        </div>
      ))}
    </div>
  );
}

import { Link } from '@bedrockio/router';
import { ArrowRight, Clock, DollarSign, Star, Store, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

import PageHeader from 'components/PageHeader';
import { StatCard } from 'components/StatCard';

import { useSession } from 'stores/session';

import { cn } from '@/lib/utils';

import { request } from 'utils/api';
import { formatCurrency } from 'utils/currency';
import { formatNumber } from 'utils/formatting';

// Catalog price bands (priceUsd is stored in whole dollars).
const PRICE_BANDS = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25–$50', min: 25, max: 50 },
  { label: '$50–$100', min: 50, max: 100 },
  { label: '$100–$250', min: 100, max: 250 },
  { label: '$250+', min: 250, max: Infinity },
];

const priceOf = (p) => (typeof p.priceUsd === 'number' ? p.priceUsd : 0);
const usd0 = (n) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(n);

export default function Dashboard() {
  const { user } = useSession();
  const [stats, setStats] = useState(null);
  const [bands, setBands] = useState(null);
  const [topShops, setTopShops] = useState(null);

  useEffect(() => {
    let active = true;

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

    async function search(resource, body) {
      try {
        return await request({
          method: 'POST',
          path: `/1/${resource}/search`,
          body,
        });
      } catch {
        return null;
      }
    }

    (async () => {
      const nowIso = new Date().toISOString();
      const in30Iso = new Date(Date.now() + 30 * 864e5).toISOString();
      const [productsRes, shopsRes, featured, expiring] = await Promise.all([
        search('products', { limit: 1000 }),
        search('shops', { limit: 200 }),
        total('products', { isFeatured: true }),
        total('products', { expiresAt: { gte: nowIso, lte: in30Iso } }),
      ]);
      if (!active) return;

      const products = productsRes?.data ?? [];
      const shops = shopsRes?.data ?? [];

      // Catalog value + price distribution from the product sample.
      const catalogValue = products.reduce((s, p) => s + priceOf(p), 0);
      const bandData = PRICE_BANDS.map((b) => ({
        label: b.label,
        count: products.filter((p) => priceOf(p) >= b.min && priceOf(p) < b.max)
          .length,
      }));

      // Top shops by catalog value (sum of listed product prices), grouped from
      // the same sample. Shop ref may be populated or a bare id — handle both,
      // falling back to the shops list for the name.
      const shopName = {};
      shops.forEach((s) => {
        shopName[s.id] = s.name;
      });
      const agg = {};
      products.forEach((p) => {
        const ref = p.shop;
        const id = ref && typeof ref === 'object' ? ref.id : ref;
        if (!id) return;
        if (!agg[id]) {
          agg[id] = {
            id,
            name:
              (ref && typeof ref === 'object' && ref.name) ||
              shopName[id] ||
              'Unknown shop',
            value: 0,
            products: 0,
          };
        }
        agg[id].value += priceOf(p);
        agg[id].products += 1;
      });
      const top = Object.values(agg)
        .sort((a, b) => b.value - a.value)
        .slice(0, 3);

      setStats({
        products: productsRes?.meta?.total ?? null,
        shops: shopsRes?.meta?.total ?? null,
        featured,
        expiring,
        catalogValue: productsRes ? catalogValue : null,
      });
      setBands(productsRes ? bandData : null);
      setTopShops(shopsRes || productsRes ? top : null);
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
        Your catalog at a glance — open any section for the full picture.
      </p>

      {/* KPI strip */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
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
        <StatCard
          label="Catalog value"
          value={usd0(stats?.catalogValue)}
          hint="sum of listed prices"
          icon={DollarSign}
        />
      </div>

      {/* Analytics + top shops */}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <SectionCard title="Catalog by price" to="/products" linkLabel="View products">
          <div className="mt-1">
            <PriceBandChart bands={bands} />
          </div>
        </SectionCard>

        <SectionCard title="Top shops" to="/shops" linkLabel="All shops">
          <p className="text-muted-foreground -mt-3 mb-1 text-xs">
            By catalog value
          </p>
          <TopShops shops={topShops} />
        </SectionCard>
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

/** A titled panel whose header links to the full section. */
function SectionCard({ title, to, linkLabel, children, className }) {
  return (
    <div className={cn('card-soft rounded-2xl p-6', className)}>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold">{title}</h2>
        {to && (
          <Link
            to={to}
            className="text-primary inline-flex items-center gap-1 text-xs font-semibold no-underline hover:underline">
            {linkLabel}
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

/** Top shops by catalog value — each row opens that shop. */
function TopShops({ shops }) {
  if (!shops) {
    return (
      <div className="flex flex-col">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <div className="bg-muted h-4 w-2/3 rounded" />
            </div>
            <div className="bg-muted h-4 w-14 rounded" />
          </div>
        ))}
      </div>
    );
  }
  if (shops.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-sm">
        No shops with priced products yet.
      </p>
    );
  }
  return (
    <div className="flex flex-col">
      {shops.map((s) => (
        <Link
          key={s.id}
          to={`/shops/${s.id}`}
          className="group border-border flex items-center gap-3 border-t py-3 no-underline first:border-t-0">
          <div className="min-w-0 flex-1">
            <div className="text-foreground truncate text-sm font-semibold group-hover:underline">
              {s.name}
            </div>
            <div className="text-muted-foreground text-xs">
              {formatNumber(s.products)} product{s.products === 1 ? '' : 's'}
            </div>
          </div>
          <div className="font-mono text-sm font-semibold tabular-nums">
            {usd0(s.value)}
          </div>
        </Link>
      ))}
    </div>
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

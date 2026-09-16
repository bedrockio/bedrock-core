import { Link } from '@bedrockio/router';
import { ArrowRight, Clock, DollarSign, Star, Store, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';

import PageHeader from 'components/PageHeader';
import { StatCard } from 'components/StatCard';

import { cn } from '@/lib/utils';

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

const priceOf = (p) => (typeof p.priceUsd === 'number' ? p.priceUsd : 0);
const hasPrice = (p) => typeof p.priceUsd === 'number';
const usd0 = (n) =>
  n == null
    ? '—'
    : new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(n);

function shopLocation(shop) {
  if (!shop) return '';
  return [shop.address?.city, shop.country].filter(Boolean).join(', ');
}

export default function Dashboard() {
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

      const priced = products.filter(hasPrice);
      const catalogValue = products.reduce((s, p) => s + priceOf(p), 0);
      const avgPrice = priced.length ? catalogValue / priced.length : null;
      const sorted = priced.map(priceOf).sort((a, b) => a - b);
      const medianPrice = sorted.length
        ? sorted.length % 2
          ? sorted[(sorted.length - 1) / 2]
          : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : null;

      const bandData = PRICE_BANDS.map((b) => ({
        label: b.label,
        count: products.filter((p) => priceOf(p) >= b.min && priceOf(p) < b.max)
          .length,
      }));

      // Group products by shop (ref may be populated or a bare id); enrich with
      // the shops list for name + location; rank top 3 by catalog value.
      const shopById = {};
      shops.forEach((s) => {
        shopById[s.id] = s;
      });
      const agg = {};
      products.forEach((p) => {
        const ref = p.shop;
        const id = ref && typeof ref === 'object' ? ref.id : ref;
        if (!id) return;
        if (!agg[id]) {
          const rec = shopById[id] || (typeof ref === 'object' ? ref : null);
          agg[id] = {
            id,
            name: rec?.name || 'Unknown shop',
            location: shopLocation(rec),
            value: 0,
            products: 0,
            featured: 0,
          };
        }
        agg[id].value += priceOf(p);
        agg[id].products += 1;
        if (p.isFeatured) agg[id].featured += 1;
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
        avgPrice,
        medianPrice,
      });
      setBands(productsRes ? bandData : null);
      setTopShops(shopsRes || productsRes ? top : null);
    })();

    return () => {
      active = false;
    };
  }, []);

  const fmt = (n) => (n == null ? '—' : formatNumber(n));
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

      {/* Top shops — storefront cards */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Top shops" to="/shops" linkLabel="All shops" />
        <TopShops shops={topShops} catalogValue={stats?.catalogValue} />
      </section>

      {/* Catalog analytics */}
      <section className="flex flex-col gap-4">
        <SectionHeader
          title="Catalog analytics"
          to="/products"
          linkLabel="View products"
        />
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="card-soft rounded-2xl p-6">
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h3 className="text-sm font-semibold">Catalog by price</h3>
              <span className="text-muted-foreground text-xs tabular-nums">
                {bands
                  ? `${fmt(bands.reduce((s, b) => s + b.count, 0))} priced`
                  : ''}
              </span>
            </div>
            <PriceBandChart bands={bands} />
          </div>
          <div className="card-soft rounded-2xl p-6">
            <h3 className="mb-5 text-sm font-semibold">Featured mix</h3>
            <FeaturedMix
              featured={stats?.featured}
              products={stats?.products}
              avgPrice={stats?.avgPrice}
              medianPrice={stats?.medianPrice}
            />
          </div>
        </div>
      </section>
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

/** Section title with a link into the full view. */
function SectionHeader({ title, to, linkLabel }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
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
  );
}

function TopShops({ shops, catalogValue }) {
  const grid = 'grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]';
  if (!shops) {
    return (
      <div className={grid}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="card-soft h-40 rounded-2xl" />
        ))}
      </div>
    );
  }
  if (shops.length === 0) {
    return (
      <div className="card-soft rounded-2xl p-6">
        <p className="text-muted-foreground text-sm">
          No shops with priced products yet.
        </p>
      </div>
    );
  }
  return (
    <div className={grid}>
      {shops.map((s) => (
        <StorefrontCard key={s.id} shop={s} catalogValue={catalogValue} />
      ))}
    </div>
  );
}

/** A storefront summary card — stats + share of catalog value; opens the shop. */
function StorefrontCard({ shop, catalogValue }) {
  const share = catalogValue ? Math.round((shop.value / catalogValue) * 100) : 0;
  return (
    <Link
      to={`/shops/${shop.id}`}
      className="card-soft group flex flex-col gap-4 rounded-2xl p-4 no-underline transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-primary/10 text-primary grid size-10 shrink-0 place-items-center rounded-lg font-semibold">
            {shop.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <div className="text-foreground truncate text-sm font-semibold group-hover:underline">
              {shop.name}
            </div>
            {shop.location && (
              <div className="text-muted-foreground truncate text-xs">
                {shop.location}
              </div>
            )}
          </div>
        </div>
        <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="flex gap-5">
        <CardStat value={formatNumber(shop.products)} label="Products" />
        <CardStat value={formatNumber(shop.featured)} label="Featured" />
        <CardStat value={usd0(shop.value)} label="Value" />
      </div>

      <div>
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary/85 h-full rounded-full"
            style={{ width: `${Math.max(share, 2)}%` }}
          />
        </div>
        <div className="text-muted-foreground mt-1.5 text-xs">
          {share}% of catalog value
        </div>
      </div>
    </Link>
  );
}

function CardStat({ value, label }) {
  return (
    <div>
      <div className="font-mono text-base font-bold tabular-nums">{value}</div>
      <div className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
}

/** Featured-vs-standard donut with average/median price readouts. */
function FeaturedMix({ featured, products, avgPrice, medianPrice }) {
  const pct =
    featured != null && products ? Math.round((featured / products) * 100) : null;
  const standard =
    featured != null && products != null ? products - featured : null;
  const hole = 'radial-gradient(closest-side, transparent 62%, #000 63%)';
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-5">
        <div className="relative size-28 shrink-0">
          <div
            className="size-full rounded-full"
            style={{
              background: `conic-gradient(var(--primary) 0 ${pct ?? 0}%, var(--muted) ${pct ?? 0}% 100%)`,
              WebkitMaskImage: hole,
              maskImage: hole,
            }}
          />
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <div className="font-mono text-xl font-bold tabular-nums">
                {pct == null ? '—' : `${pct}%`}
              </div>
              <div className="text-muted-foreground text-[10px]">featured</div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <LegendRow color="var(--primary)" label="Featured" value={featured} />
          <LegendRow color="var(--muted)" label="Standard" value={standard} />
        </div>
      </div>
      <div className="border-border grid grid-cols-2 gap-4 border-t pt-4">
        <div>
          <div className="text-muted-foreground text-xs">Avg. price</div>
          <div className="font-mono text-sm font-semibold tabular-nums">
            {avgPrice == null ? '—' : usd0(avgPrice)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs">Median price</div>
          <div className="font-mono text-sm font-semibold tabular-nums">
            {medianPrice == null ? '—' : usd0(medianPrice)}
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="size-2.5 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
      <span>{label}</span>
      <span className="ml-4 font-mono font-semibold tabular-nums">
        {value == null ? '—' : formatNumber(value)}
      </span>
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

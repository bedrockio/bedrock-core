import { useEffect, useState } from 'react';

import { StatCard, StatGrid } from 'components/StatCard';

import { request } from 'utils/api';
import { formatNumber } from 'utils/formatting';

/**
 * A row of out-of-the-box KPIs for a list screen, computed from real search
 * counts (total + created in the last 7 / 30 days). Generic across resources
 * that carry `createdAt` (every Bedrock model does). Fails soft to "—".
 *
 *   <ListStats resource="products" label="Products" />
 */
export default function ListStats({ resource, label }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;

    async function count(body) {
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

    async function load() {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const week = new Date(now - 7 * day).toISOString();
      const month = new Date(now - 30 * day).toISOString();
      const [total, recent7, recent30] = await Promise.all([
        count({}),
        count({ createdAt: { gte: week } }),
        count({ createdAt: { gte: month } }),
      ]);
      if (active) {
        setStats({ total, recent7, recent30 });
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [resource]);

  const fmt = (n) => (n == null ? '—' : formatNumber(n));

  return (
    <StatGrid>
      <StatCard label={`Total ${label}`} value={fmt(stats?.total)} hint="all time" />
      <StatCard
        label="New this week"
        value={fmt(stats?.recent7)}
        hint="last 7 days"
      />
      <StatCard
        label="New this month"
        value={fmt(stats?.recent30)}
        hint="last 30 days"
      />
    </StatGrid>
  );
}

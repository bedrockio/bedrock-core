import { Spinner } from '@/components/ui/spinner';

import { formatNumber } from 'utils/formatting';

import { useSearch } from './Context';

export default function SearchStatus() {
  const { meta, loading, error } = useSearch();

  if (loading) {
    return <Spinner />;
  } else if (error) {
    return <span className="text-destructive text-sm">{error.message}</span>;
  } else if (meta) {
    const total = formatNumber(meta.total);
    const s = meta.total === 1 ? '' : 's';
    return (
      <span className="text-sm">
        {total} result{s} found
      </span>
    );
  }

  return null;
}

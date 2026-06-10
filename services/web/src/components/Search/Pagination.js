import { useMemo } from 'react';

import { Pagination } from '@/components/ui/pagination';

import { useSearch } from './Context';

export default function SearchPagination() {
  const { loading, meta, setSkip } = useSearch();

  const page = useMemo(() => {
    if (meta) {
      const { skip, limit } = meta;
      return Math.floor(skip / limit) + 1;
    } else {
      return 1;
    }
  }, [meta]);

  function onPageChange(newPage) {
    window.scrollTo(0, 0);
    setSkip((newPage - 1) * meta.limit);
  }

  if (!meta || meta.total <= meta.limit) {
    return null;
  }

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <div>
      <div className="border-border mb-4 border-t" />
      <Pagination
        page={page}
        total={totalPages}
        disabled={loading}
        onChange={onPageChange}
      />
    </div>
  );
}

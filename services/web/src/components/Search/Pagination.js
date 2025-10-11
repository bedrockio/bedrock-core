import { Divider, Pagination } from '@mantine/core';
import React, { useMemo } from 'react';

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
    <React.Fragment>
      <Divider mb="md" />
      <Pagination
        boundaries={2}
        siblings={2}
        value={page}
        disabled={loading}
        onChange={onPageChange}
        total={totalPages}
      />
    </React.Fragment>
  );
}

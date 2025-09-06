import { Divider, Pagination } from '@mantine/core';
import React, { useContext } from 'react';

import SearchContext from './Context';

export default function SearchPagination() {
  const { loading, error, page, meta, onPageChange } =
    useContext(SearchContext);

  const handlePageChange = (newPage) => {
    window.scrollTo(0, 0);
    onPageChange(null, { activePage: newPage });
  };

  if (!meta || error || meta.total <= meta.limit) {
    return null;
  }

  const totalPages = Math.ceil(meta.total / meta.limit);

  return (
    <React.Fragment>
      <Divider mb="md" />
      <Pagination
        boundaries={2}
        siblings={2}
        disabled={loading}
        value={page}
        onChange={handlePageChange}
        total={totalPages}
      />
    </React.Fragment>
  );
}

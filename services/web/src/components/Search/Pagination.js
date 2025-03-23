import { useContext } from 'react';
import { Pagination } from '@mantine/core';

import SearchContext from './Context';

const SearchPagination = () => {
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
    <Pagination
      boundaries={2}
      siblings={2}
      disabled={loading}
      loading={loading}
      value={page}
      onChange={handlePageChange}
      total={totalPages}
    />
  );
};

export default SearchPagination;

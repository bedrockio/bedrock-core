import React from 'react';
import { Pagination } from '/semantic';

export default ({ page, limit, total, onPageChange, className }) => {
  return (
    <Pagination
      className={className}
      nextItem={
        page * limit - total < 0
          ? {
              'aria-label': 'Next Page',
              content: 'Next',
            }
          : null
      }
      prevItem={
        page !== 1
          ? {
              'aria-label': 'Previous item',
              content: 'Previous',
            }
          : null
      }
      onPageChange={onPageChange}
      activePage={page}
      firstItem={null}
      lastItem={null}
      totalPages={Math.ceil(total / limit)}
    />
  );
};

import React from 'react';
import Pagination from 'components/Pagination';

import SearchContext from './Context';

export default class SearchPagination extends React.Component {
  static contextType = SearchContext;

  onPageChange = (evt, props) => {
    window.scrollTo(0, 0);
    this.context.onPageChange(evt, props);
  };

  render() {
    const { loading, error, page, meta } = this.context;
    if (loading || error || meta.total <= meta.limit) {
      return null;
    }
    return (
      <Pagination
        page={page}
        limit={meta.limit}
        total={meta.total}
        onPageChange={this.onPageChange}
      />
    );
  }
}

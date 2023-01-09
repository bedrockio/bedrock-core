import React from 'react';

import { formatNumber } from 'utils/formatting';

import SearchContext from './Context';

export default class Total extends React.Component {
  static contextType = SearchContext;

  render() {
    const { meta } = this.context;
    if (!meta) {
      return null;
    }
    return (
      <div style={{ color: '#6C727F', marginRight: '1em' }}>
        {meta?.total ? formatNumber(meta?.total) : 'No'}{' '}
        {this.props.itemName || 'results'} found
      </div>
    );
  }
}

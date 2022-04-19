import React from 'react';
import SearchContext from './Context';

export default class Total extends React.Component {
  static contextType = SearchContext;

  render() {
    const { meta } = this.context;
    if (!meta) {
      return null;
    }
    return (
      <div size="small" style={{ margin: 0, color: '#6C727F' }}>
        {meta?.total} {this.props.itemName || 'results'}
      </div>
    );
  }
}

import React from 'react';

import Label from './Label';
import SearchContext from '../../Context';

export default class Overview extends React.Component {
  static contextType = SearchContext;

  clearFilter = () => {
    this.context.onFilterChange({
      name: this.props.name,
      value: undefined,
    });
  };

  render() {
    const { filters, params = {} } = this.context;
    const filtersKeys = Object.keys(filters).filter(
      (key) => params[key]?.label
    );

    if (!this.context.ready) {
      return null;
    }
    console.log('read', this.context);

    return (
      <>
        {filtersKeys.slice(0, 3).map((key) => (
          <Label key={key} name={key} param={params[key]} />
        ))}
      </>
    );
  }
}

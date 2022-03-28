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
    const { filters, filterMapping = {} } = this.context;
    const filtersKeys = Object.keys(filters).filter(
      (key) => filterMapping[key]?.label
    );

    if (!this.context.ready) {
      return null;
    }

    return (
      <>
        {filtersKeys.map((key) => (
          <Label key={key} name={key} mapping={filterMapping[key]} />
        ))}
      </>
    );
  }
}

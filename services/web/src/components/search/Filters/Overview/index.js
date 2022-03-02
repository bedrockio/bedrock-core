import React from 'react';

import Label from './Label';
import SearchContext from '../../Context';

export default class OverviewLabel extends React.Component {
  static contextType = SearchContext;

  clearFilter = () => {
    this.context.onFilterChange({
      name: this.props.name,
      value: undefined,
    });
  };

  render() {
    const { filters, fields } = this.context;
    const filtersKeys = Object.keys(filters);

    return (
      <>
        {filtersKeys.slice(0, 3).map((key) => (
          <Label key={key} name={key} field={fields[key]} />
        ))}
      </>
    );
  }
}

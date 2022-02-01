import React, { useContext } from 'react';
import SearchContext from '../Context';
import { Label, Icon } from 'semantic';

export default function Overview({ labels }) {
  const { filters, onFilterChange } = useContext(SearchContext);
  const filtersKeys = Object.keys(filters).filter((key) => labels[key]);

  return (
    <>
      {filtersKeys.map((filter) => (
        <Label
          key={filter}
          size="large"
          style={{ marginLeft: '10px', lineHeight: '20px' }}>
          {labels[filter]}
          <Icon
            name="delete"
            onClick={() =>
              onFilterChange(null, {
                name: filter,
                value: undefined,
              })
            }
          />
        </Label>
      ))}
    </>
  );
}

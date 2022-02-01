import React, { useContext } from 'react';
import SearchContext from '../Context';
import { Label, Icon } from 'semantic';
import { truncate } from 'lodash';
import { Layout } from 'components';

export default function Overview() {
  const { filters, fields, onFilterChange } = useContext(SearchContext);
  const filtersKeys = Object.keys(filters);

  return (
    <Layout spread horizontal>
      {filtersKeys.slice(0, 3).map((key) => (
        <Label key={key} size="large">
          {fields[key].label}: {truncate(filters[key], { length: 20 })}
          <Icon
            name="delete"
            onClick={() =>
              onFilterChange(null, {
                name: key,
                value: undefined,
              })
            }
          />
        </Label>
      ))}
    </Layout>
  );
}

import React, { useContext } from 'react';
import SearchContext from '../Context';
import { Label, Icon } from 'semantic';
import { truncate } from 'lodash';
import { Layout } from 'components';

export default function Overview() {
  const { filters, fields, onFilterChange } = useContext(SearchContext);
  const filtersKeys = Object.keys(filters);

  console.log(fields, filtersKeys);

  return (
    <Layout horizontal>
      {filtersKeys.slice(0, 3).map((key) => (
        <Label
          key={key}
          basic
          style={{
            height: '36px',
            margin: '0',
            marginLeft: '0.5em',
            lineHeight: '21px',
            cursor: 'pointer',
          }}
          onClick={() =>
            onFilterChange({
              name: key,
              value: undefined,
            })
          }>
          {truncate(fields[key]?.label, { length: 25 })}
          <Icon style={{ marginTop: '5px' }} name="delete" />
        </Label>
      ))}
    </Layout>
  );
}

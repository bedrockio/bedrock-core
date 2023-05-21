import React from 'react';
import { List, Icon } from 'semantic';

import { Layout } from 'components/Layout';

import SearchContext from '../../Context';

import DisplayValue from './DisplayValue';

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

    return (
      <>
        <div
          style={{
            fontWeight: 500,
            padding: '10px',
            textAlign: 'center',
          }}>
          Enabled Filters
        </div>
        <List
          style={{
            margin: 0,
            padding: '0px 10px 10px 10px',
            width: '100%',
          }}
          verticalAlign="middle">
          {filtersKeys.map((key) => {
            const mapping = filterMapping[key];
            return (
              <List.Item
                onClick={() =>
                  this.context.onFilterChange({
                    name: key,
                    value: undefined,
                  })
                }
                key={key}
                style={{
                  cursor: 'pointer',
                  borderTop: '0.5px solid rgba(127, 127, 127, .25)',
                  padding: '10px 0px 10px 0px',
                }}>
                <Layout horizontal center spread>
                  {mapping.label}:{' '}
                  <DisplayValue mapping={mapping} value={filters[key]} />
                  <Icon fitted name="close" style={{ top: 0 }} />
                </Layout>
              </List.Item>
            );
          })}
        </List>
      </>
    );
  }
}

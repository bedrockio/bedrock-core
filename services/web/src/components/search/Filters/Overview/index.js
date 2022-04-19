import React from 'react';
import { List, Icon } from 'semantic';

import SearchContext from '../../Context';
import { Layout } from 'components/Layout';

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
        <List
          style={{ marginTop: '5px', marginBottom: '5px' }}
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
                  color: '#000',
                  width: '200px',
                  padding: '10px 0px 10px 0px',
                }}>
                <Layout horizontal center spread>
                  {mapping.label}
                  <Icon name="close" />
                </Layout>
              </List.Item>
            );
          })}
        </List>
      </>
    );
  }
}

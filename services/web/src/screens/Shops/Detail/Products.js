import React from 'react';
import {
  Table,
  Message,
  Loader,
  Button,
  Header,
  Divider,
  Image,
} from 'semantic';
import { Link } from 'react-router-dom';

import screen from 'helpers/screen';

import { Layout, HelpTip, Search, SearchFilters } from 'components';

import ErrorMessage from 'components/ErrorMessage';

import EditProduct from 'modals/EditProduct';

import { formatDateTime } from 'utils/date';
import { formatUsd } from 'utils/currency';
import { request } from 'utils/api';

// --- Generator: subscreen-imports
import { urlForUpload } from 'utils/uploads';
// --- Generator: end

import Actions from '../Actions';
import Menu from './Menu';
import DetailsContext from './Context';

@screen
export default class ShopProducts extends React.Component {
  static contextType = DetailsContext;

  onDataNeeded = async (params) => {
    const { item } = this.context;
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: {
        ...params,
        shop: item.id,
      },
    });
  };

  render() {
    const { item: shop } = this.context;
    return (
      <Search.Provider onDataNeeded={this.onDataNeeded}>
        {({ items, getSorted, setSort, reload, loading, error }) => {
          return (
            <React.Fragment>
              <Menu {...this.props} />
              <Layout horizontal center spread>
                <Header as="h2">Products</Header>
                <Layout horizontal right center>
                  <Search.Total />
                  <SearchFilters.Keyword />
                </Layout>
              </Layout>
              <ErrorMessage error={error} />
              {loading ? (
                <Loader active />
              ) : items.length === 0 ? (
                <Message>No products added yet</Message>
              ) : (
                <Table sortable celled>
                  <Table.Header>
                    <Table.Row>
                      {/* --- Generator: list-header-cells */}
                      <Table.HeaderCell
                        width={3}
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}>
                        Name
                      </Table.HeaderCell>
                      {/* --- Generator: end */}
                      <Table.HeaderCell width={2}>Image</Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => setSort('priceUsd')}
                        sorted={getSorted('priceUsd')}>
                        Price
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        sorted={getSorted('createdAt')}
                        onClick={() => setSort('createdAt')}>
                        Created
                        <HelpTip
                          title="Created"
                          text="This is the date and time the item was created."
                        />
                      </Table.HeaderCell>
                      <Table.HeaderCell textAlign="center">
                        Actions
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {items.map((item) => {
                      return (
                        <Table.Row key={item.id}>
                          {/* --- Generator: list-body-cells */}
                          <Table.Cell>
                            <Link to={`/products/${item.id}`}>{item.name}</Link>
                          </Table.Cell>
                          {/* --- Generator: end */}
                          <Table.Cell>
                            {item.images[0] && (
                              <Image
                                style={{ width: '100%' }}
                                src={urlForUpload(item.images[0])}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell>{formatUsd(item.priceUsd)}</Table.Cell>
                          <Table.Cell>
                            {formatDateTime(item.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <EditProduct
                              shop={shop}
                              product={item}
                              onSave={reload}
                              trigger={<Button basic icon="pen-to-square" />}
                            />
                            <Actions item={item} reload={reload} />
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              )}
              <Divider hidden />
              <Search.Pagination />
            </React.Fragment>
          );
        }}
      </Search.Provider>
    );
  }
}

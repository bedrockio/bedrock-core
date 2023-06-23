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

import { withPage } from 'stores/page';

import screen from 'helpers/screen';

import { Layout, HelpTip, Search, SearchFilters } from 'components';
import ErrorMessage from 'components/ErrorMessage';

// --- Generator: subscreen-imports
// --- Generator: end

import EditProduct from 'modals/EditProduct';

import Actions from 'screens/Products/Actions';

import { urlForUpload } from 'utils/uploads';
import { request } from 'utils/api';
import { formatUsd } from 'utils/currency';
import { formatDateTime } from 'utils/date';

import Menu from './Menu';

@screen
@withPage
export default class ShopProducts extends React.Component {
  onDataNeeded = async (params) => {
    const { shop } = this.context;
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: {
        ...params,
        shop: shop.id,
      },
    });
  };

  render() {
    const { shop } = this.context;
    return (
      <Search.Provider onDataNeeded={this.onDataNeeded}>
        {({ items: products, getSorted, setSort, reload, loading, error }) => {
          return (
            <React.Fragment>
              <Menu {...this.props} />
              <Layout horizontal center spread>
                <Header as="h2">Products</Header>
                <Layout horizontal right center>
                  <Search.Total />
                  <SearchFilters.Search name="keyword" />
                </Layout>
              </Layout>
              <ErrorMessage error={error} />
              {loading ? (
                <Loader active />
              ) : products.length === 0 ? (
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
                          text="This is the date and time the product was created."
                        />
                      </Table.HeaderCell>
                      <Table.HeaderCell textAlign="center">
                        Actions
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {products.map((product) => {
                      return (
                        <Table.Row key={product.id}>
                          {/* --- Generator: list-body-cells */}
                          <Table.Cell>
                            <Link to={`/products/${product.id}`}>
                              {product.name}
                            </Link>
                          </Table.Cell>
                          {/* --- Generator: end */}
                          <Table.Cell>
                            {product.images[0] && (
                              <Image
                                style={{ width: '100%' }}
                                src={urlForUpload(product.images[0])}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell>{formatUsd(product.priceUsd)}</Table.Cell>
                          <Table.Cell>
                            {formatDateTime(product.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <EditProduct
                              shop={shop}
                              product={product}
                              onSave={reload}
                              trigger={<Button basic icon="pen-to-square" />}
                            />
                            <Actions product={product} reload={reload} />
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

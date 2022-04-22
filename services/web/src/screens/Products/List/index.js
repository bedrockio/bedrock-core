import React from 'react';
import { Image, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Table, Button, Divider, Confirm } from 'semantic';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';
import { formatUsd } from 'utils/currency';
import { request } from 'utils/api';
import screen from 'helpers/screen';

import {
  HelpTip,
  Breadcrumbs,
  Layout,
  Search,
  SearchFilters,
} from 'components';

import EditProduct from 'modals/EditProduct';

@screen
export default class ProductList extends React.Component {
  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: { ...params },
    });
  };

  getFilterMapping() {
    return {
      isFeatured: {
        label: 'Is Featured',
        type: 'boolean',
      },
      priceUsd: {
        label: 'Price Usd',
      },
      expiresAt: {
        label: 'Expires At',
        type: 'date',
        range: true,
      },
      sellingPoints: {
        label: 'Selling Points',
        multiple: true,
      },
      keyword: {},
    };
  }

  render() {
    return (
      <Search.Provider
        limit={5}
        onDataNeeded={this.onDataNeeded}
        filterMapping={this.getFilterMapping()}>
        {({ items: products, getSorted, setSort, reload }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Products" />
              <Layout horizontal center spread stackable>
                <h1>Products</h1>
                <Layout.Group>
                  <Search.Export filename="products" />
                  <EditProduct
                    trigger={
                      <Button primary content="New Product" icon="plus" />
                    }
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>

              <Segment>
                <Layout horizontal spread stackable>
                  <SearchFilters.Modal>
                    <SearchFilters.Checkbox
                      name="isFeatured"
                      label="Is Featured"
                    />
                    <SearchFilters.Number name="priceUsd" label="Price Usd" />
                    <SearchFilters.DateRange
                      time
                      name="expiresAt"
                      label="Expires At"
                    />
                    <SearchFilters.Dropdown
                      search
                      multiple
                      selection
                      allowAdditions
                      name="sellingPoints"
                      label="Selling Points"
                    />
                  </SearchFilters.Modal>

                  <Layout horizontal stackable center right>
                    <Search.Total />
                    <SearchFilters.Search name="keyword" />
                  </Layout>
                </Layout>
              </Segment>

              <Search.Status />

              {products.length !== 0 && (
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell>Images</Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => setSort('priceUsd')}
                        sorted={getSorted('priceUsd')}>
                        Price
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => setSort('createdAt')}
                        sorted={getSorted('createdAt')}>
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
                          <Table.Cell>
                            <Link to={`/products/${product.id}`}>
                              {product.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            {product.images[0] && (
                              <Image
                                size="tiny"
                                src={urlForUpload(product.images[0], true)}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell>{formatUsd(product.priceUsd)}</Table.Cell>
                          <Table.Cell>
                            {formatDateTime(product.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center" singleLine>
                            <EditProduct
                              product={product}
                              trigger={<Button basic icon="edit" />}
                              onSave={reload}
                            />
                            <Confirm
                              negative
                              confirmButton="Delete"
                              header={`Are you sure you want to delete "${product.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/products/${product.id}`,
                                });
                                reload();
                              }}
                            />
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

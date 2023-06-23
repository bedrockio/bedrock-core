import React from 'react';
import { Image, Segment } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Table, Button, Divider } from 'semantic';

import screen from 'helpers/screen';

import {
  HelpTip,
  Breadcrumbs,
  Layout,
  Search,
  SearchFilters,
} from 'components';

import EditProduct from 'modals/EditProduct';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';
import { formatUsd } from 'utils/currency';
import { request } from 'utils/api';

import Actions from '../Actions';

@screen
export default class ProductList extends React.Component {
  onDataNeeded = async (body) => {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body,
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
      createdAt: {
        label: 'Created At',
        type: 'date',
        range: true,
      },
      keyword: {},
    };
  }

  render() {
    return (
      <Search.Provider
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
                      name="sellingPoints"
                      label="Selling Points"
                    />
                    <SearchFilters.DateRange
                      time
                      name="createdAt"
                      label="Created At"
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
                      <Table.HeaderCell>Image</Table.HeaderCell>
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
                      const [image] = product.images;
                      return (
                        <Table.Row key={product.id}>
                          <Table.Cell>
                            <Link to={`/products/${product.id}`}>
                              {product.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            {image && (
                              <Image
                                size="tiny"
                                src={urlForUpload(image, true)}
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
                              trigger={<Button basic icon="pen-to-square" />}
                              onSave={reload}
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

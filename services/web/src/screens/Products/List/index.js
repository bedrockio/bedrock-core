import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Message, Confirm } from 'semantic';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { HelpTip, Breadcrumbs, SearchProvider, Layout } from 'components';

import Filters from 'modals/Filters';
import EditProduct from 'modals/EditProduct';

import { urlForUpload } from 'utils/uploads';
import { Image } from 'semantic-ui-react';

@screen
export default class ProductList extends React.Component {
  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: params,
    });
  };

  render() {
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({
          items: products,
          getSorted,
          setSort,
          filters,
          setFilters,
          reload,
        }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Products" />
              <Layout horizontal center spread>
                <h1>Products</h1>
                <Layout.Group>
                  <Filters onSave={setFilters} filters={filters}>
                    <Filters.Text name="name" label="Name" />
                    <Filters.Checkbox name="isFeatured" label="Is Featured" />
                    <Filters.Number name="priceUsd" label="Price Usd" />
                    <Filters.Date time name="expiresAt" label="Expires At" />
                    <Filters.Dropdown
                      search
                      multiple
                      allowAdditions
                      name="sellingPoints"
                      label="Selling Points"
                    />
                  </Filters>
                  <EditProduct
                    trigger={
                      <Button primary content="New Product" icon="plus" />
                    }
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>
              {products.length === 0 ? (
                <Message>No products created yet</Message>
              ) : (
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
            </React.Fragment>
          );
        }}
      </SearchProvider>
    );
  }
}

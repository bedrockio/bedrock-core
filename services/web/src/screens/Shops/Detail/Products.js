import React from 'react';
import {
  Table,
  Message,
  Loader,
  Button,
  Header,
  Divider,
  Confirm,
} from 'semantic';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { Layout, HelpTip } from 'components';
import { SearchProvider, Filters } from 'components/search';
import ErrorMessage from 'components/ErrorMessage';
// --- Generator: subscreen-imports
import { Link } from 'react-router-dom';
import { Image } from 'semantic';
import { urlForUpload } from 'utils/uploads';
// --- Generator: end

import EditProduct from 'modals/EditProduct';

import Menu from './Menu';

@screen
export default class ShopProducts extends React.Component {
  onDataNeeded = async (params) => {
    const { shop } = this.props;
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
    const { shop } = this.props;
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({ items: products, getSorted, setSort, reload, loading, error }) => {
          return (
            <React.Fragment>
              <Menu {...this.props} />
              <Layout horizontal center spread>
                <Header as="h2">Products</Header>
                <Layout.Group>
                  <Filters.Modal size="small">
                    <Filters.Search
                      label="Search"
                      name="keyword"
                      placeholder="Enter name or product id"
                    />
                  </Filters.Modal>
                  <EditProduct
                    shop={shop}
                    onSave={reload}
                    trigger={
                      <Button
                        primary
                        size="small"
                        content="Add Product"
                        icon="plus"
                      />
                    }
                  />
                </Layout.Group>
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
                      <Table.HeaderCell width={2}>Image</Table.HeaderCell>
                      <Table.HeaderCell
                        width={3}
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell width={3}>Description</Table.HeaderCell>
                      {/* --- Generator: end */}
                      <Table.HeaderCell
                        width={3}
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
                    {products.map((product) => {
                      return (
                        <Table.Row key={product.id}>
                          {/* --- Generator: list-body-cells */}
                          <Table.Cell>
                            {product.images[0] && (
                              <Image
                                style={{ width: '100%' }}
                                src={urlForUpload(product.images[0])}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Link to={`/products/${product.id}`}>
                              {product.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>{product.description}</Table.Cell>
                          {/* --- Generator: end */}
                          <Table.Cell>
                            {formatDateTime(product.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <EditProduct
                              shop={shop}
                              product={product}
                              onSave={reload}
                              trigger={<Button basic icon="edit" />}
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
              <SearchProvider.Pagination />
            </React.Fragment>
          );
        }}
      </SearchProvider>
    );
  }
}

import React from 'react';
import { Table, Message, Loader, Button, Header, Divider , Image } from 'semantic';
import { Link } from 'react-router-dom';

import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { Layout, HelpTip, Search, SearchFilters, Confirm } from 'components';
import ErrorMessage from 'components/ErrorMessage';
// --- Generator: subscreen-imports
import { urlForUpload } from 'utils/uploads';
// --- Generator: end

import EditProduct from 'modals/EditProduct';

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
                  <SearchFilters.Search name="keyword" />
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
                    {items.map((item) => {
                      return (
                        <Table.Row key={item.id}>
                          {/* --- Generator: list-body-cells */}
                          <Table.Cell>
                            {item.images[0] && (
                              <Image
                                style={{ width: '100%' }}
                                src={urlForUpload(item.images[0])}
                              />
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Link to={`/products/${item.id}`}>{item.name}</Link>
                          </Table.Cell>
                          <Table.Cell>{item.description}</Table.Cell>
                          {/* --- Generator: end */}
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
                            <Confirm
                              negative
                              confirmButton="Delete"
                              header={`Are you sure you want to delete "${item.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/products/${item.id}`,
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

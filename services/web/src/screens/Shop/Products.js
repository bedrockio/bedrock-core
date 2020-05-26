import React from 'react';
import { Container, Table, Message, Button, Header } from 'semantic-ui-react';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';

import { SearchProvider } from 'components/data';
import { Layout } from 'components/Layout';
import { Confirm } from 'components/Semantic';
import HelpTip from 'components/HelpTip';
import EditProduct from 'components/modals/EditProduct';

export default class ShopProducts extends React.Component {

  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: params
    });
  };

  render() {
    const { shop } = this.props;
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({ items, getSorted, setSort, reload }) => {
          return (
            <Container>
              <Header as="h2">
                <Layout horizontal center spread>
                  Products
                  <EditProduct
                    shopId={shop.id}
                    onSave={reload}
                    trigger={
                      <Button primary floated="right" style={{ marginTop: '-5px' }} content="Add Product" icon="plus" />
                    }
                  />
                </Layout>
              </Header>
              {items.length === 0 ? (
                <Message>No products added yet</Message>
              ) : (
                <Table celled>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell width={3} sorted={getSorted('name')} onClick={() => setSort('name')}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell width={3}>Description</Table.HeaderCell>
                      <Table.HeaderCell
                        width={3}
                        sorted={getSorted('createdAt')}
                        onClick={() => setSort('createdAt')}>
                        Created
                        <HelpTip title="Created" text="This is the date and time the product was created." />
                      </Table.HeaderCell>
                      <Table.HeaderCell textAlign="center">Actions</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {items.map((item) => {
                      return (
                        <Table.Row key={item.id}>
                          <Table.Cell>{item.name}</Table.Cell>
                          <Table.Cell>{item.description}</Table.Cell>
                          <Table.Cell>{formatDateTime(item.createdAt)}</Table.Cell>
                          <Table.Cell textAlign="center">
                            <EditProduct
                              shopId={shop.id}
                              product={item}
                              onSave={reload}
                              trigger={<Button style={{ marginLeft: '20px' }} basic icon="edit" />}
                            />
                            <Confirm
                              negative
                              confirmText="Delete"
                              header={`Are you sure you want to delete "${item.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/products/${item.id}`
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
            </Container>
          );
        }}
      </SearchProvider>
    );
  }
}

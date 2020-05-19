import React from 'react';
import { Container, Table, Message, Button, Header } from 'semantic-ui-react';
import inject from 'stores/inject';

import { Confirm } from 'components/Semantic';
import { formatDateTime } from 'utils/date';
import { SearchProvider } from 'components/data';
import HelpTip from 'components/HelpTip';
import EditProduct from 'components/modals/EditProduct';

@inject('products')
export default class ShopProducts extends React.Component {

  onDataNeeded = async (params) => {
    return await this.context.products.search(params);
  };

  render() {
    const { shop } = this.props;
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({ items, getSorted, setSort, reload }) => {
          return (
            <Container>
              <Header as="h2">
                Products
                <EditProduct
                  shopId={shop.id}
                  onSave={reload}
                  trigger={
                    <Button primary floated="right" style={{ marginTop: '-5px' }} content="Add Product" icon="plus" />
                  }
                />
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
                                await this.context.products.delete(item);
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

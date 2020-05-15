import React from 'react';
import { observer, inject } from 'mobx-react';
import { Container, Table, Message, Modal, Button, Header } from 'semantic-ui-react';

import { formatDate } from 'utils/date';
import { SearchProvider } from 'components/data';
import HelpTip from 'components/HelpTip';
import EditProduct from 'components/modals/EditProduct';

@inject('products')
@observer
export default class ShopProducts extends React.Component {

  onDataNeeded = async (params) => {
    return await this.props.products.search(params);
  };

  render() {
    return (
      <Container>
        <SearchProvider onDataNeeded={this.onDataNeeded}>
          {({ items, getSorted, setSort, reload }) => {
            return (
              <React.Fragment>
                <Header as="h2">
                  Products
                  <EditProduct
                    initialValues={{
                      shopId: this.props.shop.id,
                    }}
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
                            <Table.Cell>{formatDate(item.createdAt)}</Table.Cell>
                            <Table.Cell textAlign="center">
                              <EditProduct
                                initialValues={item}
                                onSave={reload}
                                trigger={<Button style={{ marginLeft: '20px' }} basic icon="edit" />}
                              />
                              <Modal
                                header={`Are you sure you want to delete "${item.name}"?`}
                                content="All data will be permanently deleted"
                                trigger={<Button basic icon="trash" />}
                                closeIcon
                                actions={[
                                  {
                                    key: 'delete',
                                    primary: true,
                                    content: 'Delete',
                                    onClick: async () => {
                                      await this.props.products.delete(item);
                                      reload();
                                    },
                                  },
                                ]}
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
      </Container>
    );
  }
}

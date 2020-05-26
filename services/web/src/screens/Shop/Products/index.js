import React from 'react';
import { observer, inject } from 'mobx-react';
import { DateTime } from 'luxon';

import styled from 'styled-components';
import Pagination from 'components/Pagination';
import HelpTip from 'components/HelpTip';
import EditProduct from 'components/modals/EditProduct';
import { Layout } from 'components/Layout';

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

import {
  Container,
  Table,
  Loader,
  Segment,
  Dimmer,
  Message,
  Modal,
  Button,
  Header
} from 'semantic-ui-react';

@inject('products')
@observer
export default class ShopProducts extends React.Component {
  componentDidMount() {
    const { products } = this.props;
    products.setShopId(this.props.shop.id);
    this.fetchItems();
  }

  handleRemove = (item) => {
    const { products } = this.props;
    products.delete(item);
  };

  fetchItems() {
    const { products } = this.props;
    return products.fetchItems();
  }

  render() {
    const { products } = this.props;
    const listStatus = products.getStatus('list');
    const deleteStatus = products.getStatus('delete');

    return (
      <Container>
        <div className="list">
          <Header as="h2">
            <Layout horizontal center spread>
              Products
              <EditProduct
                initialValues={{
                  shopId: this.props.shop.id
                }}
                trigger={
                  <Button
                    primary
                    content="Add Product"
                    icon="plus"
                  />
                }
              />
            </Layout>
          </Header>
          {listStatus.success && !products.items.length && (
            <Message>No products added yet</Message>
          )}
          {listStatus.success && products.items.length > 0 && (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={3}>Name</Table.HeaderCell>
                  <Table.HeaderCell width={3}>Description</Table.HeaderCell>
                  <Table.HeaderCell>
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
                {products.items.map((item) => {
                  return (
                    <Table.Row key={item.id}>
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell>{item.description}</Table.Cell>
                      <Table.Cell>
                        {DateTime.fromJSDate(item.createdAt).toLocaleString(
                          DateTime.DATETIME_MED
                        )}
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <EditProduct
                          initialValues={item}
                          trigger={
                            <Button
                              style={{ marginLeft: '20px' }}
                              basic
                              icon="edit"
                            />
                          }
                        />
                        <Modal
                          header={`Are you sure you want to delete "${item.name}"?`}
                          content="All data will be permanently deleted"
                          status={deleteStatus}
                          trigger={<Button basic icon="trash" />}
                          closeIcon
                          actions={[
                            {
                              key: 'delete',
                              primary: true,
                              content: 'Delete',
                              onClick: () => this.handleRemove(item)
                            }
                          ]}
                        />
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          )}
          {listStatus.success && products.totalItems > products.limit && (
            <Center>
              <Pagination
                limit={products.limit}
                page={products.page}
                total={products.totalItems}
                onPageChange={(e, { activePage }) => {
                  products.setPage(activePage);
                  this.fetchItems().then(() => {
                    window.scrollTo(0, 0);
                  });
                }}
              />
            </Center>
          )}
          {listStatus.request && (
            <Segment style={{ height: '100px' }}>
              <Dimmer active inverted>
                <Loader>Loading</Loader>
              </Dimmer>
            </Segment>
          )}
          {listStatus.error && (
            <Message error content={listStatus.error.message} />
          )}
        </div>
      </Container>
    );
  }
}

import React from 'react';
import { Table, Message, Loader, Image, Button, Header } from 'semantic-ui-react';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import { screen } from 'helpers';
import { urlForUpload } from 'utils/uploads';
import {
  Layout,
  Confirm,
  HelpTip,
  SearchProvider,
} from 'components';
import { EditProduct } from 'modals';
import Menu from './Menu';

@screen
export default class ShopProducts extends React.Component {
  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/products/search',
      body: params,
    });
  };

  render() {
    const { shop } = this.props;
    return (
      <React.Fragment>
        <Menu {...this.props} />
        {shop ? (
          <SearchProvider onDataNeeded={this.onDataNeeded}>
            {({ items, getSorted, setSort, reload }) => {
              return (
                <React.Fragment>
                  <Header as="h2">
                    <Layout horizontal center spread>
                      Products
                      <EditProduct
                        shopId={shop.id}
                        onSave={reload}
                        trigger={
                          <Button primary size="tiny" floated="right" content="Add Product" icon="plus" />
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
                          <Table.HeaderCell width={2}>Image</Table.HeaderCell>
                          <Table.HeaderCell width={3} sorted={getSorted('name')} onClick={() => setSort('name')}>
                            Name
                          </Table.HeaderCell>
                          <Table.HeaderCell width={3}>Description</Table.HeaderCell>
                          <Table.HeaderCell width={3} sorted={getSorted('createdAt')} onClick={() => setSort('createdAt')}>
                            Created
                            <HelpTip title="Created" text="This is the date and time the product was created." />
                          </Table.HeaderCell>
                          <Table.HeaderCell textAlign="center">Actions</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {items.map((item) => {
                          const [image] = item.images;
                          return (
                            <Table.Row key={item.id}>
                              <Table.Cell>
                                {image && <Image style={{ width: '100%' }} src={urlForUpload(image, true)} />}
                              </Table.Cell>
                              <Table.Cell>{item.name}</Table.Cell>
                              <Table.Cell>{item.description}</Table.Cell>
                              <Table.Cell>{formatDateTime(item.createdAt)}</Table.Cell>
                              <Table.Cell textAlign="center">
                                <EditProduct
                                  shopId={shop.id}
                                  item={item}
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
                </React.Fragment>
              );
            }}
          </SearchProvider>
        ) : (
          <Loader active>Loading</Loader>
        )}
      </React.Fragment>
    );
  }
}

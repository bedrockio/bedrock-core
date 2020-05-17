import React from 'react';
import { Link } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { Container, Header, Table, Button, Message, Modal } from 'semantic-ui-react';
import { formatDate } from 'utils/date';

import AppWrapper from 'components/AppWrapper';
import HelpTip from 'components/HelpTip';
import EditShop from 'components/modals/EditShop';
import { SearchProvider } from 'components/data';

@inject('shops')
@observer
export default class Shops extends React.Component {
  onDataNeeded = async (params) => {
    return await this.props.shops.search(params);
  };

  render() {
    return (
      <AppWrapper>
        <Container>
          <SearchProvider onDataNeeded={this.onDataNeeded}>
            {({ items, getSorted, setSort, reload }) => {
              return (
                <React.Fragment>
                  <Header as="h2">
                    Shops
                    <EditShop
                      trigger={
                        <Button primary floated="right" style={{ marginTop: '-5px' }} content="New Shop" icon="plus" />
                      }
                      onSave={reload}
                    />
                  </Header>
                  {items.length === 0 ? (
                    <Message>No shops created yet</Message>
                  ) : (
                    <Table celled sortable>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell width={3} onClick={() => setSort('name')} sorted={getSorted('name')}>
                            Name
                          </Table.HeaderCell>
                          <Table.HeaderCell width={3}>Description</Table.HeaderCell>
                          <Table.HeaderCell onClick={() => setSort('createdAt')} sorted={getSorted('createdAt')}>
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
                              <Table.Cell>
                                <Link to={`/shops/${item.id}`}>{item.name}</Link>
                              </Table.Cell>
                              <Table.Cell>{item.description}</Table.Cell>
                              <Table.Cell>{formatDate(item.createdAt)}</Table.Cell>
                              <Table.Cell textAlign="center">
                                <EditShop
                                  shop={item}
                                  trigger={<Button style={{ marginLeft: '20px' }} basic icon="edit" />}
                                  onSave={reload}
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
                                        await this.props.shops.delete(item);
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
      </AppWrapper>
    );
  }
}

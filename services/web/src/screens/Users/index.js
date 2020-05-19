import React from 'react';
import { formatDateTime } from 'utils/date';
import inject from 'stores/inject';

import { Confirm } from 'components/Semantic';
import AppWrapper from 'components/AppWrapper';
import HelpTip from 'components/HelpTip';
import EditUser from 'components/modals/EditUser';
import { SearchProvider } from 'components/data';

import {
  Container,
  Header,
  Table,
  Message,
  Button
} from 'semantic-ui-react';

@inject('users')
export default class Users extends React.Component {

  onDataNeeded = async (params) => {
    return await this.context.users.search(params);
  };

  render() {
    return (
      <AppWrapper>
        <SearchProvider onDataNeeded={this.onDataNeeded}>
          {({ items, getSorted, setSort, reload }) => {
            return (
              <Container>
                <Header as="h2">
                  Users
                  <EditUser
                    trigger={
                      <Button
                        primary
                        floated="right"
                        style={{ marginTop: '-5px' }}
                        content="New User"
                        icon="plus"
                      />
                    }
                    onSave={reload}
                  />
                </Header>
                {items.length === 0 ? (
                  <Message>No users added yet</Message>
                ) : (
                  <Table celled sortable>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell
                          width={3}
                          onClick={() => setSort('name')}
                          sorted={getSorted('name')}>
                          Name
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          width={3}
                          onClick={() => setSort('email')}
                          sorted={getSorted('email')}>
                          Email
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          width={3}
                          onClick={() => setSort('roles')}
                          sorted={getSorted('roles')}>
                          Roles
                        </Table.HeaderCell>
                        <Table.HeaderCell
                          onClick={() => setSort('createdAt')}
                          sorted={getSorted('createdAt')}>
                          Joined
                          <HelpTip
                            title="Joined"
                            text="This is the date and time the user was created."
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
                            <Table.Cell>{item.name}</Table.Cell>
                            <Table.Cell>{item.email}</Table.Cell>
                            <Table.Cell>
                              {item.roles
                                  .map((r) => r.slice(0, 1).toUpperCase() + r.slice(1))
                                  .join(', ')}
                                </Table.Cell>
                                <Table.Cell>{formatDateTime(item.createdAt)}</Table.Cell>
                                <Table.Cell textAlign="center">
                                  <EditUser
                                    user={item}
                                    trigger={
                                      <Button
                                        style={{ marginLeft: '20px' }}
                                        basic
                                        icon="edit"
                                      />
                                    }
                                    onSave={reload}
                                  />
                                  <Confirm
                                    negative
                                    confirmText="Delete"
                                    header={`Are you sure you want to delete "${item.name}"?`}
                                    content="All data will be permanently deleted"
                                    trigger={<Button basic icon="trash" />}
                                    onConfirm={async () => {
                                      await this.context.users.delete(item);
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
      </AppWrapper>
    );
  }
}

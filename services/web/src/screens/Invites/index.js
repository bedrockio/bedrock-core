import React from 'react';
import { observer, inject } from 'mobx-react';
import { formatDate } from 'utils/date';

import AppWrapper from 'components/AppWrapper';
import InviteUser from 'components/modals/InviteUser';
import { SearchProvider } from 'components/data';
import LoadButton from 'components/LoadButton';

import {
  Container,
  Header,
  Table,
  Button,
  Message,
} from 'semantic-ui-react';

@inject('invites')
@observer
export default class Home extends React.Component {

  state = {};

  onDataNeeded = async (params) => {
    return await this.props.invites.search(params);
  };

  render() {
    return (
      <AppWrapper>
        <SearchProvider onDataNeeded={this.onDataNeeded}>
          {({ items, getSorted, setSort, reload }) => {
            return (
              <Container>
                <Header as="h2">
                  Invites
                  <InviteUser
                    size="tiny"
                    onSave={reload}
                    trigger={
                      <Button
                        primary
                        floated="right"
                        style={{ marginTop: '-5px' }}
                        content="Invite User"
                        icon="plus"
                      />
                    }
                  />
                </Header>
                <div className="list">
                  {items.length === 0 ? (
                    <Message>No invitations yet</Message>
                  ) : (
                    <Table celled sortable>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Email</Table.HeaderCell>
                          <Table.HeaderCell
                            onClick={() => setSort('status')}
                            sorted={getSorted('status')}>
                            Status
                          </Table.HeaderCell>
                          <Table.HeaderCell
                            width={3}
                            onClick={() => setSort('createdAt')}
                            sorted={getSorted('createdAt')}>
                            Invited At
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
                              <Table.Cell>
                                {item.email}
                              </Table.Cell>
                              <Table.Cell collapsing>{item.status}</Table.Cell>
                              <Table.Cell collapsing>
                                {formatDate(item.createdAt)}
                              </Table.Cell>
                              <Table.Cell textAlign="center">
                                <LoadButton
                                  basic
                                  icon="trash"
                                  title="Delete"
                                  onClick={async () => {
                                    await this.props.invites.delete(item);
                                    reload();
                                  }}
                                />
                                <LoadButton
                                  basic
                                  icon="mail"
                                  title="Resend Invite"
                                  onClick={async () => {
                                    await this.props.invites.resend(item);
                                    //reload();
                                  }}
                                />
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table>
                  )}
                </div>
              </Container>
            );
          }}
        </SearchProvider>
      </AppWrapper>
    );
  }
}

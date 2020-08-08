import React from 'react';
import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';
import { screen } from 'helpers';

import { SearchProvider } from 'components/data';
import { Layout } from 'components/Layout';
import AppWrapper from 'components/AppWrapper';
import InviteUser from 'components/modals/InviteUser';
import LoadButton from 'components/LoadButton';

import {
  Container,
  Header,
  Table,
  Button,
  Message,
} from 'semantic-ui-react';

@screen
export default class Home extends React.Component {

  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/invites/search',
      body: params
    });
  };

  render() {
    return (
      <AppWrapper>
        <SearchProvider onDataNeeded={this.onDataNeeded}>
          {({ items, getSorted, setSort, reload }) => {
            return (
              <Container>
                <Header as="h2">
                  <Layout horizontal center spread>
                    Invites
                    <InviteUser
                      size="tiny"
                      onSave={reload}
                      trigger={
                        <Button
                          primary
                          content="Invite User"
                          icon="plus"
                        />
                      }
                    />
                  </Layout>
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
                                {formatDateTime(item.createdAt)}
                              </Table.Cell>
                              <Table.Cell textAlign="center">
                                <LoadButton
                                  basic
                                  icon="mail"
                                  title="Resend Invite"
                                  onClick={async () => {
                                    await request({
                                      method: 'POST',
                                      path: `/1/invites/${item.id}/resend`
                                    });
                                    reload();
                                  }}
                                />
                                <LoadButton
                                  basic
                                  icon="trash"
                                  title="Delete"
                                  onClick={async () => {
                                    await request({
                                      method: 'DELETE',
                                      path: `/1/invites/${item.id}`
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
                </div>
              </Container>
            );
          }}
        </SearchProvider>
      </AppWrapper>
    );
  }
}

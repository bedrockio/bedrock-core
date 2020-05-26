import React from 'react';
import { observer, inject } from 'mobx-react';
import { DateTime } from 'luxon';
import { Layout } from 'components/Layout';

import styled from 'styled-components';
import AppWrapper from 'components/AppWrapper';
import InviteUser from 'components/modals/InviteUser';
import Pagination from 'components/Pagination';

import {
  Container,
  Header,
  Table,
  Button,
  Loader,
  Segment,
  Dimmer,
  Message
} from 'semantic-ui-react';

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

@inject('invites')
@observer
export default class Home extends React.Component {
  state = {
    showInviteDialog: false,
    invites: []
  };

  componentDidMount() {
    this.props.invites.fetchItems();
  }

  handleOnInvite = () => {
    this.fetchInvites();
  };

  render() {
    const { invites } = this.props;
    const listStatus = invites.getStatus('list');

    return (
      <AppWrapper>
        <Container>
          <Header as="h2">
            <Layout horizontal center spread>
              Invites
              <InviteUser
                size="tiny"
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
            {listStatus.success && !invites.items.length && (
              <Message>No invitations yet</Message>
            )}
            {listStatus.success && invites.items.length > 0 && (
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                    <Table.HeaderCell width={3}>Status</Table.HeaderCell>
                    <Table.HeaderCell width={3}>Invited At</Table.HeaderCell>
                    <Table.HeaderCell textAlign="center">
                      Actions
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {invites.items.map((item) => {
                    return (
                      <Table.Row key={item.id}>
                        <Table.Cell>
                          <Header as="h4">
                            <Header.Content>{item.email}</Header.Content>
                          </Header>
                        </Table.Cell>
                        <Table.Cell collapsing>{item.status}</Table.Cell>
                        <Table.Cell collapsing>
                          {DateTime.fromJSDate(item.createdAt).toLocaleString(
                            DateTime.DATETIME_MED
                          )}
                        </Table.Cell>
                        <Table.Cell textAlign="center">
                          <Button
                            loading={
                              invites.getStatus(`delete:${item.id}`).request
                            }
                            onClick={() =>
                              this.props.invites.delete(
                                item,
                                `delete:${item.id}`
                              )
                            }
                            basic
                            icon="trash"
                          />
                          <Button
                            loading={
                              invites.getStatus(`resend:${item.id}`).request
                            }
                            onClick={() =>
                              this.props.invites.resend(
                                item,
                                `resend:${item.id}`
                              )
                            }
                            title="Resend Invite"
                            basic
                            icon="mail"
                          />
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            )}
            {listStatus.success && invites.totalItems > invites.limit && (
              <Center>
                <Pagination
                  limit={invites.limit}
                  page={invites.page}
                  total={invites.totalItems}
                  onPageChange={(e, { activePage }) => {
                    invites.setPage(activePage);
                    invites.fetchItems().then(() => {
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
      </AppWrapper>
    );
  }
}

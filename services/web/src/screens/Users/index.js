import React from 'react';
import { observer, inject } from 'mobx-react';
import { DateTime } from 'luxon';
import AppWrapper from 'components/AppWrapper';
import styled from 'styled-components';
import { Layout } from 'components/Layout';

import HelpTip from 'components/HelpTip';
import EditUser from 'components/modals/EditUser';

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

import {
  Container,
  Header,
  Table,
  Loader,
  Segment,
  Dimmer,
  Message,
  Modal,
  Button
} from 'semantic-ui-react';
import Pagination from 'components/Pagination';

@inject('appSession', 'users')
@observer
export default class Users extends React.Component {
  state = {
    showCreateDialog: false,
    editItem: null
  };
  constructor(props) {
    super(props);
    this.createOrEditDialog = React.createRef();
  }

  componentDidMount() {
    this.props.users.fetchItems();
  }

  handleRemove = (item) => {
    const { users } = this.props;
    users.delete(item);
  };

  render() {
    const { users } = this.props;
    const listStatus = users.getStatus('list');
    const deleteStatus = users.getStatus('delete');

    return (
      <AppWrapper>
        <Container>
          <Header as="h2">
            <Layout horizontal center spread>
              Users
              <EditUser
                trigger={
                  <Button
                    primary
                    content="New User"
                    icon="plus"
                  />
                }
              />
            </Layout>
          </Header>
          <div className="list">
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={3}>E-mail</Table.HeaderCell>
                  <Table.HeaderCell width={3}>Roles</Table.HeaderCell>
                  <Table.HeaderCell>
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
                {!users.items.length && (
                  <Table.Row>
                    <Table.Cell>No users added yet</Table.Cell>
                  </Table.Row>
                )}
                {users.items.map((item) => {
                  return (
                    <Table.Row key={item.id}>
                      <Table.Cell>{item.email}</Table.Cell>
                      <Table.Cell>
                        {item.roles
                          .map((r) => r.slice(0, 1).toUpperCase() + r.slice(1))
                          .join(', ')}
                      </Table.Cell>
                      <Table.Cell>
                        {DateTime.fromJSDate(item.createdAt).toLocaleString(
                          DateTime.DATETIME_MED
                        )}
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <EditUser
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
            {listStatus.success && users.totalItems > users.limit && (
              <Center>
                <Pagination
                  limit={users.limit}
                  page={users.page}
                  total={users.totalItems}
                  onPageChange={(e, { activePage }) => {
                    users.setPage(activePage);
                    users.fetchItems().then(() => {
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

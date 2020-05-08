import React from 'react';
//import { observer, inject } from 'mobx-react';
import { DateTime } from 'luxon';
import AppWrapper from 'components/AppWrapper';
import Pagination from 'components/Pagination';
import { inject } from 'utils/store';

import styled from 'styled-components';
import { Link } from 'react-router-dom';
import HelpTip from 'components/HelpTip';
import EditShop from 'components/modals/EditShop';

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

const Center = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
`;

@inject('shops')
export default class ShopsScreen extends React.Component {
  state = {
    showCreateDialog: false,
    editItem: null,
    currentPage: 1,
    data: [],
    status: { request: true }
  };

  componentDidMount() {
    this.props.shops.search();
  }

  handleRemove = (item) => {
    const { shops } = this.props;
    shops.delete(item);
  };

  handleSort = (field) => {
    const { shops } = this.props;
    const sort = shops.sort;
    if (sort.field !== field) {
      shops.setSort({
        field: field,
        order: 'asc'
      });
    } else {
      shops.setSort({
        field: field,
        order: sort.order === 'asc' ? 'desc' : 'asc'
      });
    }
    shops.fetchItems();
  };

  render() {
    const { shops } = this.props;
    return (
      <AppWrapper>
        <Container>
          <Header as="h2">
            Shops
            {/*
            <EditShop
              trigger={
                <Button
                  primary
                  floated="right"
                  style={{ marginTop: '-5px' }}
                  content="New Shop"
                  icon="plus"
                />
              }
            />
            */}
          </Header>
          <div className="list">
            {shops.error && (
              <Message error content={shops.error} />
            )}
            {shops.loading ? (
              <Segment style={{ height: '100px' }}>
                <Dimmer active inverted>
                  <Loader>Loading</Loader>
                </Dimmer>
              </Segment>
            ) : (
              <React.Fragment>
                {shops.empty ? (
                  <Message>No shops created yet</Message>
                ) : (
                  <React.Fragment>
                    <Table celled sortable>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell
                            width={3}
                            onClick={() => this.handleSort('name')}
                            sorted={shops.sorted}
                          >
                            Name
                          </Table.HeaderCell>
                          <Table.HeaderCell width={3}>Description</Table.HeaderCell>
                          <Table.HeaderCell
                            onClick={() => this.handleSort('createdAt')}
                            sorted={shops.sorted}
                          >
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
                        {shops.map((item) => {
                          return (
                            <Table.Row key={item.id}>
                              <Table.Cell>
                                <Link to={`/shops/${item.id}`}>{item.name}</Link>
                              </Table.Cell>
                              <Table.Cell>{item.description}</Table.Cell>
                              <Table.Cell>
                                {DateTime.fromJSDate(item.createdAt).toLocaleString(
                                  DateTime.DATETIME_MED
                                )}
                              </Table.Cell>
                              <Table.Cell textAlign="center">
                                {/*
                                <EditShop
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
                                  header={`Are you sure you want to delete "${
                                    item.name
                                  }"?`}
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
                                */}
                              </Table.Cell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table>
                    {shops.total > shops.limit && (
                      <Center>
                        <Pagination
                          limit={shops.limit}
                          page={shops.page}
                          total={shops.total}
                          onPageChange={(e, { activePage }) => {
                            shops.setPage(activePage);
                            shops.fetchItems().then(() => {
                              window.scrollTo(0, 0);
                            });
                          }}
                        />
                      </Center>
                    )}
                  </React.Fragment>
                )}
              </React.Fragment>
            )}
          </div>
        </Container>
      </AppWrapper>
    );
  }
}

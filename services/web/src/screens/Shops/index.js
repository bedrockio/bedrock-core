import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Header, Table, Button, Message } from 'semantic-ui-react';
import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';
import { Confirm } from 'components/Semantic';

import AppWrapper from 'components/AppWrapper';
import HelpTip from 'components/HelpTip';
import EditShop from 'components/modals/EditShop';
import Filters from 'components/modals/Filters';
import { SearchProvider } from 'components/data';

import { getData } from 'country-list';

const countries = getData().map(({ code, name }) => ({
  value: code,
  text: name,
  key: code
}));

export default class Shops extends React.Component {

  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/shops/search',
      body: params
    });
  };

  render() {
    return (
      <AppWrapper>
        <SearchProvider onDataNeeded={this.onDataNeeded}>
          {({ items, getSorted, setSort, filters, setFilters, reload }) => {
            return (
              <Container>
                <div style={{float: 'right', marginTop: '-5px'}}>
                  <Filters
                    onSave={setFilters}
                    filters={filters}
                    fields={[
                      {
                        text: 'Country',
                        name: 'country',
                        options: countries,
                      }
                    ]}
                  />
                  <EditShop
                    trigger={
                      <Button primary content="New Shop" icon="plus" />
                    }
                    onSave={reload}
                  />
                </div>
                <Header as="h2">
                  Shops
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
                            <Table.Cell>{formatDateTime(item.createdAt)}</Table.Cell>
                            <Table.Cell textAlign="center">
                              <EditShop
                                shop={item}
                                trigger={<Button style={{ marginLeft: '20px' }} basic icon="edit" />}
                                onSave={reload}
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
                                    path: `/1/shops/${item.id}`
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
              </Container>
            );
          }}
        </SearchProvider>
      </AppWrapper>
    );
  }
}

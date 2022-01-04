import React from 'react';
import {
  Table,
  Button,
  Message,
  Divider,
  Loader,
  Confirm,
  Label,
} from 'semantic';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { SearchProvider } from 'components/search';
import EditApplication from 'modals/EditApplication';
import Menu from './Menu';

@screen
export default class Applications extends React.Component {
  onDataNeeded = async (params) => {
    const { category, ...rest } = params;
    return await request({
      method: 'POST',
      path: '/1/applications/mine/search',
      body: {
        ...rest,
        ...(category && { categories: [category.id] }),
      },
    });
  };

  render() {
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({ items, getSorted, setSort, reload, loading, error }) => {
          return (
            <React.Fragment>
              <Menu />
              <h1>Your applications</h1>

              {loading ? (
                <Loader active />
              ) : error ? (
                <Message error content={error.message} />
              ) : items.length === 0 ? (
                <Message>No applications created yet</Message>
              ) : (
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell width={4}>Description</Table.HeaderCell>
                      <Table.HeaderCell>ClientId</Table.HeaderCell>
                      <Table.HeaderCell>Request Count</Table.HeaderCell>
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
                          <Table.Cell>{item.description}</Table.Cell>
                          <Table.Cell>
                            <Label>{item.clientId}</Label>
                          </Table.Cell>
                          <Table.Cell>{item.requestCount}</Table.Cell>
                          <Table.Cell textAlign="center">
                            <EditApplication
                              application={item}
                              trigger={<Button basic icon="edit" />}
                              onSave={reload}
                            />
                            <Confirm
                              negative
                              confirmButton="Delete"
                              header={`Are you sure you want to delete "${item.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/applications/${item.id}`,
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
              <Divider hidden />
              <SearchProvider.Pagination />
            </React.Fragment>
          );
        }}
      </SearchProvider>
    );
  }
}

import React from 'react';
import { Table, Button, Message, Divider, Loader } from 'semantic';
import { Link } from 'react-router-dom';

import screen from 'helpers/screen';

import Breadcrumbs from 'components/Breadcrumbs';
import Layout from 'components/Layout';
import Search from 'components/Search';
import Confirm from 'components/Confirm';

import EditApplication from 'modals/EditApplication';

import { request } from 'utils/api';

@screen
export default class Applications extends React.Component {
  onDataNeeded = async (body) => {
    return await request({
      method: 'POST',
      path: '/1/applications/mine/search',
      body,
    });
  };

  render() {
    return (
      <Search.Provider onDataNeeded={this.onDataNeeded}>
        {({ items, getSorted, setSort, reload, loading, error }) => {
          return (
            <React.Fragment>
              <Breadcrumbs
                link={<Link to="/applications">Applications</Link>}
                active="Applications"
              />
              <Layout horizontal center spread>
                <h1>My Applications</h1>
                <Layout.Group>
                  <EditApplication
                    trigger={
                      <Button primary content="New Appliction" icon="plus" />
                    }
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>

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
                      <Table.HeaderCell>APIKey</Table.HeaderCell>
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
                          <Table.Cell>
                            <Link to={`/applications/${item.id}`}>
                              {item.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>{item.description}</Table.Cell>
                          <Table.Cell>
                            <code>{item.apiKey}</code>
                          </Table.Cell>
                          <Table.Cell>{item.requestCount}</Table.Cell>
                          <Table.Cell textAlign="center">
                            <EditApplication
                              application={item}
                              trigger={<Button basic icon="pen-to-square" />}
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
              <Search.Pagination />
            </React.Fragment>
          );
        }}
      </Search.Provider>
    );
  }
}

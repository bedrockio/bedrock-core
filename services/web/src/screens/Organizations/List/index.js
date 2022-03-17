import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Message, Divider, Loader, Confirm } from 'semantic';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import screen from 'helpers/screen';

import { HelpTip, Breadcrumbs, Layout } from 'components';
import { SearchProvider, Filters } from 'components/search';
import ErrorMessage from 'components/ErrorMessage';

import EditOrganization from 'modals/EditOrganization';

@screen
export default class OrganizationList extends React.Component {
  onDataNeeded = async (params) => {
    const { category, ...rest } = params;
    return await request({
      method: 'POST',
      path: '/1/organizations/search',
      body: {
        ...rest,
        ...(category && { categories: [category.id] }),
      },
    });
  };

  render() {
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({
          items: organizations,
          getSorted,
          setSort,
          reload,
          loading,
          error,
        }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Organizations" />
              <Layout horizontal center spread>
                <h1>Organizations</h1>
                <Layout.Group>
                  <Filters.Modal>
                    <Filters.Search
                      name="keyword"
                      label="Name"
                      placeholder="Enter name"
                    />
                  </Filters.Modal>
                  <EditOrganization
                    trigger={
                      <Button primary content="New Organization" icon="plus" />
                    }
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>
              <ErrorMessage error={error} />
              {loading ? (
                <Loader active />
              ) : organizations.length === 0 ? (
                <Message>No organizations created yet</Message>
              ) : (
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}>
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => setSort('createdAt')}
                        sorted={getSorted('createdAt')}>
                        Created
                        <HelpTip
                          title="Created"
                          text="This is the date and time the organization was created."
                        />
                      </Table.HeaderCell>
                      <Table.HeaderCell textAlign="center">
                        Actions
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {organizations.map((organization) => {
                      return (
                        <Table.Row key={organization.id}>
                          <Table.Cell>
                            <Link to={`/organizations/${organization.id}`}>
                              {organization.name}
                            </Link>
                          </Table.Cell>
                          <Table.Cell>
                            {formatDateTime(organization.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <EditOrganization
                              organization={organization}
                              trigger={<Button basic icon="edit" />}
                              onSave={reload}
                            />
                            <Confirm
                              negative
                              confirmButton="Delete"
                              header={`Are you sure you want to delete "${organization.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/organizations/${organization.id}`,
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

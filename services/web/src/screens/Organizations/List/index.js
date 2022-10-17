import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Segment, Divider } from 'semantic';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import screen from 'helpers/screen';

import {
  HelpTip,
  Breadcrumbs,
  Layout,
  Search,
  SearchFilters,
  Confirm,
} from 'components';

import EditOrganization from 'modals/EditOrganization';
import Actions from '../Actions';

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
      <Search.Provider onDataNeeded={this.onDataNeeded}>
        {({ items: organizations, getSorted, setSort, reload }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Organizations" />

              <Layout horizontal center spread>
                <h1>Organizations</h1>
                <Layout.Group>
                  <EditOrganization
                    trigger={
                      <Button primary content="New Organization" icon="plus" />
                    }
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>
              <Segment>
                <Layout horizontal center spread stackable>
                  <Layout horizontal stackable center right>
                    <Search.Total />
                    <SearchFilters.Search name="keyword" />
                  </Layout>
                </Layout>
              </Segment>

              <Search.Status />

              {organizations.length !== 0 && (
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
                            <Actions item={organization} reload={reload} />
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

import React from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Segment, Divider, Label } from 'semantic';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import screen from 'helpers/screen';

import {
  HelpTip,
  Breadcrumbs,
  Layout,
  Search,
  SearchFilters,
} from 'components';

import ShowAuditEntry from 'modals/ShowAuditEntry';

@screen
export default class AuditTrailList extends React.Component {
  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/audit-entries/search',
      body: params,
    });
  };

  fetchUsers = async (props) => {
    const { data } = await request({
      method: 'POST',
      path: '/1/users/search',
      body: props,
    });
    return data;
  };

  fetchSearchOptions = async (props) => {
    const { data } = await request({
      method: 'POST',
      path: '/1/audit-entries/search-options',
      body: props,
    });
    return data;
  };

  getColorForCategory = (category) => {
    if (category === 'security') {
      return 'orange';
    }
    return 'green';
  };

  render() {
    return (
      <Search.Provider onDataNeeded={this.onDataNeeded}>
        {({ items, getSorted, setSort }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Organizations" />

              <Layout horizontal center spread>
                <h1>Audit Trail</h1>
                <Layout.Group></Layout.Group>
              </Layout>
              <Segment>
                <Layout horizontal center spread stackable>
                  <SearchFilters.Modal>
                    <SearchFilters.Dropdown
                      onDataNeeded={(name) => this.fetchUsers({ name })}
                      search
                      name="user"
                      label="User"
                    />
                    <SearchFilters.Dropdown
                      onDataNeeded={() =>
                        this.fetchSearchOptions({ field: 'category' })
                      }
                      name="category"
                      label="Category"
                    />
                    <SearchFilters.Dropdown
                      onDataNeeded={() =>
                        this.fetchSearchOptions({ field: 'activity' })
                      }
                      name="activity"
                      label="Activity"
                    />
                    <SearchFilters.Dropdown
                      onDataNeeded={() =>
                        this.fetchSearchOptions({
                          field: 'routeNormalizedPath',
                        })
                      }
                      name="routeNormalizedPath"
                      label="Route Normalized Path"
                    />

                    <SearchFilters.Dropdown
                      onDataNeeded={() =>
                        this.fetchSearchOptions({
                          field: 'objectType',
                        })
                      }
                      name="objectType"
                      label="ObjectType"
                    />
                  </SearchFilters.Modal>
                  <Layout horizontal stackable center right>
                    <Search.Total />
                    <SearchFilters.Search
                      name="keyword"
                      placeholder="Enter ObjectId"
                    />
                  </Layout>
                </Layout>
              </Segment>

              <Search.Status />

              {items.length !== 0 && (
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell width={2}>User</Table.HeaderCell>
                      <Table.HeaderCell width={1}>Category</Table.HeaderCell>
                      <Table.HeaderCell width={4}>Activity</Table.HeaderCell>

                      <Table.HeaderCell width={3}>Request</Table.HeaderCell>
                      <Table.HeaderCell
                        width={4}
                        onClick={() => setSort('createdAt')}
                        sorted={getSorted('createdAt')}>
                        Date
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
                    {items.map((item) => {
                      return (
                        <Table.Row key={item.id}>
                          <Table.Cell>
                            {item.user && (
                              <Link
                                title={item.user.email}
                                to={`/users/${item.user.id}`}>
                                {item.user.firstName} {item.user.firstName}{' '}
                                <br />
                              </Link>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            <Label
                              style={{ textTransform: 'capitalize' }}
                              color={this.getColorForCategory(item.category)}>
                              {item.category || 'default'}
                            </Label>
                          </Table.Cell>
                          <Table.Cell>{item.activity}</Table.Cell>
                          <Table.Cell>
                            <code>
                              {item.requestMethod} {item.requestUrl}
                            </code>
                          </Table.Cell>
                          <Table.Cell>
                            {formatDateTime(item.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <ShowAuditEntry
                              auditEntry={item}
                              trigger={<Button basic icon="search" />}
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

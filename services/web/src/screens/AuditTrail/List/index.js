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
    const response = await request({
      method: 'POST',
      path: '/1/audit-entries/search',
      body: {
        ...params,
        include: ['*', 'actor.firstName', 'actor.lastName'],
      },
    });

    const store = {};

    (response.data || []).forEach((item) => {
      if (!item.ownerId || !item.ownerType) return;
      const list = store[item.ownerType] || [];
      list.push(item.ownerId);
      store[item.ownerType] = list;
    });

    // its split here because the owner could be a user or another collection
    const [users] = await Promise.all(
      Object.keys(store)
        .map((key) => {
          if (key === 'User') {
            const ids = [...new Set(store[key])];
            if (!ids.length) return null;
            return this.fetchUsers({
              ids,
              include: ['firstName', 'lastName', 'email'],
            });
          }
          // eslint-disable-next-line no-console
          console.error('[AuditLog] Unknown ownerType', key);
          return null;
        })
        .filter(Boolean)
    );

    response.data.forEach((item) => {
      if (item.ownerType === 'User') {
        const user = users?.find((u) => u.id === item.ownerId);
        if (!user) return;
        item.owner = user;
      }
    });

    return response;
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

  getFilterMapping() {
    return {
      actor: {
        label: 'Actor',
        getDisplayValue: async (id) => {
          const data = await this.fetchUsers({ ids: [id] });
          return data[0].name;
        },
      },
      ownerId: {
        label: 'Owner',
        getDisplayValue: async (id) => {
          const data = await this.fetchUsers({ ids: [id] });
          return data[0].name;
        },
      },
      category: {
        label: 'Category',
      },
      activity: {
        label: 'Activity',
      },
      objectType: {
        label: 'Object Type',
      },
      sessionId: {
        label: 'Session Id',
      },
      createdAt: {
        label: 'Created At',
        type: 'date',
        range: true,
      },
      keyword: {},
    };
  }

  render() {
    return (
      <Search.Provider
        filterMapping={this.getFilterMapping()}
        onDataNeeded={this.onDataNeeded}>
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
                      name="actor"
                      label="Actor"
                    />
                    <SearchFilters.Dropdown
                      onDataNeeded={(name) => this.fetchUsers({ name })}
                      search
                      name="ownerId"
                      label="Owner"
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
                          field: 'objectType',
                        })
                      }
                      name="objectType"
                      label="ObjectType"
                    />

                    <SearchFilters.Dropdown
                      onDataNeeded={() =>
                        this.fetchSearchOptions({
                          field: 'sessionId',
                        })
                      }
                      name="sessionId"
                      label="Session Id"
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
                      <Table.HeaderCell width={2}>Actor</Table.HeaderCell>
                      <Table.HeaderCell width={1}>Category</Table.HeaderCell>
                      <Table.HeaderCell width={4}>Activity</Table.HeaderCell>
                      <Table.HeaderCell width={3}>
                        Object Owner
                      </Table.HeaderCell>
                      <Table.HeaderCell width={3}>Request</Table.HeaderCell>
                      <Table.HeaderCell
                        width={3}
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
                            {item.actor && (
                              <Link
                                title={item.actor.email}
                                to={`/users/${item.actor.id}`}>
                                {item.actor.firstName} {item.actor.lastName}
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
                            {item.owner && (
                              <>
                                <Link
                                  title={item.owner.email}
                                  to={`/users/${item.owner.id}`}>
                                  {item.owner.firstName} {item.owner.lastName}
                                </Link>
                              </>
                            )}
                          </Table.Cell>
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
                              trigger={<Button basic icon="magnifying-glass" />}
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

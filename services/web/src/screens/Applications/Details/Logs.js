import React from 'react';
import { set, truncate } from 'lodash';
import { withRouter } from 'react-router-dom';
import {
  Button,
  Divider,
  Grid,
  Label,
  Loader,
  Message,
  Segment,
  Table,
} from 'semantic';

import screen from 'helpers/screen';
import { withPage } from 'stores/page';

import Code from 'components/Code';
import ShowRequest from 'modals/ShowRequest';
import { Layout, Search, SearchFilters } from 'components';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';

import Menu from './Menu';

function getStateromQueryString(search) {
  if (!search) {
    return;
  }
  const params = new URLSearchParams(search);
  return {
    keyword: params.get('requestId'),
  };
}

@screen
@withPage
@withRouter
export default class ApplicationLogs extends React.Component {
  state = {
    selectedItem: null,
    initialFilters: getStateromQueryString(this.props.location.search),
  };

  onDataNeeded = async (body) => {
    this.setState({
      selectedItem: null,
    });

    const { application } = this.context;

    if (body['response.status']) {
      set(
        body,
        'response.status'.split('.'),
        JSON.parse(body['response.status'])
      );
    }
    if (body['request.method']) {
      set(body, 'request.method'.split('.'), body['request.method']);
    }

    const resp = await request({
      method: 'POST',
      path: `/1/applications/${application.id}/logs/search`,
      body,
    });
    this.setState(
      {
        selectedItem: resp.data[0],
      },
      () => this.updateQueryString()
    );

    return resp;
  };

  getColorForHttpStatus(status) {
    if (status > 204) {
      return 'orange';
    }
    return 'green';
  }

  updateQueryString() {
    const pathName = this.props.location.pathname;
    const queryString = this.state.selectedItem
      ? `?requestId=${this.state.selectedItem.requestId}`
      : '';
    this.props.history.replace(`${pathName}${queryString}`);
  }

  render() {
    const { application } = this.context;
    const { selectedItem } = this.state;

    return (
      <React.Fragment>
        <Menu />
        <Search.Provider
          filters={this.state.initialFilters}
          onDataNeeded={this.onDataNeeded}>
          {({ items: entries, loading, error }) => {
            return (
              <React.Fragment>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={9}>
                      <Layout horizontal>
                        <SearchFilters.Search
                          style={{
                            width: '300px',
                          }}
                          name="keyword"
                          placeholder="Filter by Path or Request Id"
                        />
                        <Divider hidden vertical />
                        <SearchFilters.Dropdown
                          style={{
                            width: '120px',
                          }}
                          label=""
                          name="response.status"
                          placeholder="Status"
                          options={[
                            {
                              value: JSON.stringify({
                                gte: 200,
                                lt: 300,
                              }),
                              text: 'Succeesed',
                            },
                            {
                              value: JSON.stringify({
                                gt: 300,
                              }),
                              text: 'Failed',
                            },
                          ]}
                        />
                        <Divider hidden vertical />
                        <SearchFilters.Dropdown
                          label=""
                          name="request.method"
                          placeholder="Method"
                          options={[
                            {
                              value: 'GET',
                              text: 'GET',
                            },
                            {
                              value: 'POST',
                              text: 'POST',
                            },
                            {
                              value: 'PATCH',
                              text: 'PATCH',
                            },
                            {
                              value: 'DELETE',
                              text: 'DEL',
                            },
                          ]}
                        />
                      </Layout>
                      <Divider hidden />
                      {loading ? (
                        <Segment style={{ minHeight: '5em' }}>
                          <Loader active />
                        </Segment>
                      ) : error ? (
                        <Message error content={error.message} />
                      ) : entries.length === 0 ? (
                        <Message>No Results</Message>
                      ) : (
                        <>
                          <Grid padded="horizontally">
                            {entries.map((entry) => {
                              return (
                                <Grid.Row
                                  key={entry.id}
                                  verticalAlign={'middle'}
                                  style={{
                                    borderTop: '1px solid #ccc',
                                    paddingTop: '0.5em',
                                    paddingBottom: '0.5em',
                                    cursor: 'pointer',
                                    ...(selectedItem?.id === entry.id
                                      ? {
                                          borderLeft: '4px solid #ccc',
                                        }
                                      : {
                                          paddingLeft: '4px',
                                        }),
                                  }}
                                  onClick={() =>
                                    this.setState(
                                      {
                                        selectedItem: entry,
                                      },
                                      () => this.updateQueryString()
                                    )
                                  }>
                                  <Grid.Column width={2}>
                                    <Label
                                      color={this.getColorForHttpStatus(
                                        entry.response.status
                                      )}>
                                      {entry.response.status}
                                    </Label>
                                  </Grid.Column>
                                  <Grid.Column width={2}>
                                    <Label>
                                      {entry.request.method.toUpperCase()}
                                    </Label>
                                  </Grid.Column>
                                  <Grid.Column width={7}>
                                    {truncate(entry.request.path, {
                                      length: 30,
                                    })}
                                  </Grid.Column>
                                  <Grid.Column width={5}>
                                    {formatDateTime(entry.createdAt)}
                                  </Grid.Column>
                                </Grid.Row>
                              );
                            })}
                          </Grid>
                          <Divider hidden />
                          <Search.Pagination />
                        </>
                      )}
                    </Grid.Column>
                    {selectedItem && (
                      <Grid.Column width={7}>
                        <h2
                          style={{ marginTop: '10px' }}
                          title={`${selectedItem.request.method} ${selectedItem.request.path}`}>
                          {selectedItem.request.method}{' '}
                          {truncate(selectedItem.request.path, { length: 28 })}
                          <ShowRequest
                            centered={false}
                            application={application}
                            request={selectedItem.request}
                            requestId={selectedItem.requestId}
                            trigger={
                              <Button
                                compact
                                floated="right"
                                icon="up-right-and-down-left-from-center"
                                basic
                              />
                            }
                          />
                        </h2>

                        <Table definition>
                          <Table.Body>
                            <Table.Row>
                              <Table.Cell width={4}>Request Id</Table.Cell>
                              <Table.Cell>
                                <code>{selectedItem.requestId}</code>
                              </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>Path</Table.Cell>
                              <Table.Cell>
                                <code>{selectedItem.request.path}</code>
                              </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>IP Address</Table.Cell>
                              <Table.Cell>
                                <code>{selectedItem.request.ip}</code>
                              </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>Session</Table.Cell>
                              <Table.Cell>
                                <code>{selectedItem.request.sessionId}</code>
                              </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                              <Table.Cell>Time</Table.Cell>
                              <Table.Cell>
                                <code>
                                  {formatDateTime(selectedItem.createdAt)}
                                </code>
                              </Table.Cell>
                            </Table.Row>
                          </Table.Body>
                        </Table>

                        {selectedItem.response.body && (
                          <>
                            <h3>Response Body</h3>
                            <Code language="json" scroll>
                              {JSON.stringify(
                                selectedItem.response.body,
                                null,
                                2
                              )}
                            </Code>
                          </>
                        )}
                      </Grid.Column>
                    )}
                  </Grid.Row>
                </Grid>
              </React.Fragment>
            );
          }}
        </Search.Provider>
      </React.Fragment>
    );
  }
}

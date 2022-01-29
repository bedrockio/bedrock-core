import React from 'react';
import { Message, Divider, Loader, Label, Grid, Table, Button } from 'semantic';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { Layout } from 'components';
import { SearchProvider, Filters } from 'components/search';
import { truncate } from 'lodash';
import Menu from './Menu';

import { formatDateTime } from 'utils/date';
import CodeBlock from 'screens/Docs/CodeBlock';
import ShowRequest from 'modals/ShowRequest';

@screen
export default class ApplicationLogs extends React.Component {
  state = {
    selectedItem: null,
  };

  onDataNeeded = async (body) => {
    this.setState({
      selectedItem: null,
    });
    const resp = await request({
      method: 'POST',
      path: `/1/applications/${this.props.application.id}/logs/search`,
      body,
    });
    this.setState({
      selectedItem: resp.data[0],
    });
    return resp;
  };

  getColorForHttpStatus(status) {
    if (status > 204) {
      return 'orange';
    }
    return 'green';
  }

  render() {
    const { loading, selectedItem } = this.state;

    if (loading) {
      return <Loader active />;
    }

    return (
      <React.Fragment>
        <Menu {...this.props} />
        <SearchProvider limit={15} onDataNeeded={this.onDataNeeded}>
          {({ items, loading, error }) => {
            return (
              <React.Fragment>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={9}>
                      <Layout horizontal left>
                        <Filters.Search
                          style={{
                            width: '300px',
                          }}
                          name="keyword"
                          placeholder="Filter by path or Request Id"
                        />
                        <Divider hidden vertical />
                        <Filters.Dropdown
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
                        <Divider hidden vertical />
                        <Filters.Dropdown
                          name="response.status"
                          placeholder="Status"
                          options={[
                            {
                              value: 200,
                              text: '200',
                            },
                            {
                              value: 204,
                              text: '204',
                            },
                            {
                              value: 400,
                              text: '400',
                            },
                            {
                              value: 401,
                              text: '401',
                            },
                            {
                              value: 404,
                              text: '404',
                            },
                            {
                              value: 500,
                              text: '500',
                            },
                          ]}
                        />
                      </Layout>
                      <Divider hidden />
                      {loading ? (
                        <Loader active />
                      ) : error ? (
                        <Message error content={error.message} />
                      ) : items.length === 0 ? (
                        <Message>No Results</Message>
                      ) : (
                        <>
                          <Grid padded="horizontally">
                            {items.map((item) => {
                              return (
                                <Grid.Row
                                  key={item.id}
                                  verticalAlign={'middle'}
                                  style={{
                                    borderTop: '1px solid #ccc',
                                    paddingTop: '0.5em',
                                    paddingBottom: '0.5em',
                                    cursor: 'pointer',
                                    ...(selectedItem?.id === item.id
                                      ? {
                                          borderLeft: '4px solid #ccc',
                                        }
                                      : {
                                          paddingLeft: '4px',
                                        }),
                                  }}
                                  onClick={() =>
                                    this.setState({
                                      selectedItem: item,
                                    })
                                  }>
                                  <Grid.Column width={2}>
                                    <Label
                                      color={this.getColorForHttpStatus(
                                        item.response.status
                                      )}>
                                      {item.response.status}
                                    </Label>
                                  </Grid.Column>
                                  <Grid.Column width={2}>
                                    <Label>
                                      {item.request.method.toUpperCase()}
                                    </Label>
                                  </Grid.Column>
                                  <Grid.Column width={7}>
                                    {truncate(item.request.path, {
                                      length: 30,
                                    })}
                                  </Grid.Column>
                                  <Grid.Column width={5}>
                                    {formatDateTime(item.createdAt)}
                                  </Grid.Column>
                                </Grid.Row>
                              );
                            })}
                          </Grid>
                          <Divider hidden />
                          <SearchProvider.Pagination />
                        </>
                      )}
                    </Grid.Column>
                    {selectedItem && (
                      <Grid.Column width={7}>
                        <h2
                          style={{ marginTop: '10px' }}
                          title={`${selectedItem.request.method} ${selectedItem.request.path}`}>
                          {selectedItem.request.method}{' '}
                          {truncate(selectedItem.request.path, { length: 30 })}
                          <ShowRequest
                            request={selectedItem.request}
                            trigger={
                              <Button
                                compact
                                floated="right"
                                icon="expand-alt"
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
                              <Table.Cell>URL</Table.Cell>
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
                            <h2>Response Body</h2>
                            <CodeBlock
                              language="json"
                              value={JSON.stringify(
                                selectedItem.response.body,
                                null,
                                2
                              )}
                            />
                          </>
                        )}
                      </Grid.Column>
                    )}
                  </Grid.Row>
                </Grid>
              </React.Fragment>
            );
          }}
        </SearchProvider>
      </React.Fragment>
    );
  }
}

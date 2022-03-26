import React from 'react';
import {
  Message,
  Divider,
  Loader,
  Label,
  Grid,
  Table,
  Button,
  Segment,
} from 'semantic';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { Layout } from 'components';
import { SearchProvider, Filters } from 'components/search';
import { set, truncate } from 'lodash';
import Menu from './Menu';

import { formatDateTime } from 'utils/date';
import CodeBlock from 'components/Markdown/Code';
import ShowRequest from 'modals/ShowRequest';
import { withRouter } from 'react-router-dom';

function getStateromQueryString(search) {
  if (!search) {
    return;
  }
  const params = new URLSearchParams(search);
  return {
    keyword: params.get('requestId'),
  };
}

@withRouter
@screen
export default class ApplicationLogs extends React.Component {
  state = {
    selectedItem: null,
    initialFilters: getStateromQueryString(this.props.location.search),
  };

  onDataNeeded = async (body) => {
    this.setState({
      selectedItem: null,
    });

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
      path: `/1/applications/${this.props.application.id}/logs/search`,
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
    const { selectedItem } = this.state;

    return (
      <React.Fragment>
        <Menu {...this.props} />
        <SearchProvider
          filters={this.state.initialFilters}
          limit={15}
          onDataNeeded={this.onDataNeeded}>
          {({ items, loading, error }) => {
            return (
              <React.Fragment>
                <Grid>
                  <Grid.Row>
                    <Grid.Column width={9}>
                      <Layout horizontal>
                        <Filters.Search
                          style={{
                            width: '300px',
                          }}
                          name="keyword"
                          placeholder="Filter by Path or Request Id"
                        />
                        <Divider hidden vertical />
                        <Filters.Dropdown
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
                        <Filters.Dropdown
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
                                    this.setState(
                                      {
                                        selectedItem: item,
                                      },
                                      () => this.updateQueryString()
                                    )
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
                          {truncate(selectedItem.request.path, { length: 28 })}
                          <ShowRequest
                            centered={false}
                            application={this.props.application}
                            request={selectedItem.request}
                            requestId={selectedItem.requestId}
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
                            <CodeBlock
                              height="500px"
                              language="json"
                              source={JSON.stringify(
                                selectedItem.response.body,
                                null,
                                2
                              )}
                              allowCopy
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

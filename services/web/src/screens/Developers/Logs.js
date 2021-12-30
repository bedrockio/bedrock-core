import React from 'react';
import { Message, Divider, Loader, Label, Grid, Table, Select } from 'semantic';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { Layout } from 'components';
import { SearchProvider, Filters } from 'components/search';
import Menu from './Menu';
import { formatDateTime } from 'utils/date';
import CodeBlock from 'screens/Docs/CodeBlock';

@screen
export default class ApplicationLog extends React.Component {
  state = {
    selectedApplication: null,
    applications: [],
    selectedItem: null,
  };
  componentDidMount() {
    this.fetchApplications();
  }

  onDataNeeded = async (body) => {
    return await request({
      method: 'POST',
      path: `/1/applications/${this.state.selectedApplication.id}/logs/search`,
      body,
    });
  };

  async fetchApplications() {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/applications/mine/search',
      });
      this.setState({
        applications: data,
        selectedApplication: data[0],
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  render() {
    const { loading, selectedItem, applications, selectedApplication } =
      this.state;

    if (loading) {
      return <Loader active />;
    }

    return (
      <SearchProvider limit={15} onDataNeeded={this.onDataNeeded}>
        {({ items, loading, error, reload }) => {
          const selected = selectedItem || items[0];
          return (
            <React.Fragment>
              <Menu />
              <Layout horizontal center>
                <h1>Logs for</h1>
                <Select
                  style={{
                    marginLeft: '1em',
                  }}
                  value={selectedApplication?.id}
                  inline
                  compact
                  onChange={(e, { value }) =>
                    this.setState(
                      {
                        selectedApplication: applications.find(
                          (c) => c.id === value
                        ),
                      },
                      () => reload()
                    )
                  }
                  options={applications.map((cur) => {
                    return {
                      text: cur.name,
                      value: cur.id,
                    };
                  })}
                />
              </Layout>

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
                      value: 500,
                      text: '500',
                    },
                  ]}
                />
              </Layout>
              <Divider hidden />
              <Grid>
                <Grid.Row>
                  <Grid.Column width={8}>
                    {loading ? (
                      <Loader active />
                    ) : error ? (
                      <Message error content={error.message} />
                    ) : items.length === 0 ? (
                      <Message>No Results</Message>
                    ) : (
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
                              }}
                              onClick={() =>
                                this.setState({
                                  selectedItem: item,
                                })
                              }>
                              <Grid.Column width={2}>
                                <Label>{item.response.status}</Label>
                              </Grid.Column>
                              <Grid.Column width={2}>
                                {item.request.method.toUpperCase()}
                              </Grid.Column>
                              <Grid.Column width={7}>
                                {item.request.url}
                              </Grid.Column>
                              <Grid.Column width={5}>
                                <Label>{formatDateTime(item.createdAt)}</Label>
                              </Grid.Column>
                            </Grid.Row>
                          );
                        })}
                      </Grid>
                    )}
                  </Grid.Column>
                  {selected && (
                    <Grid.Column width={8}>
                      <h2
                        style={{
                          marginTop: '-1rem',
                        }}>
                        {selected.request.method} {selected.request.url}
                      </h2>
                      <Table definition>
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell>Request Id</Table.Cell>
                            <Table.Cell>{selected.requestId}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>Status</Table.Cell>
                            <Table.Cell>{selected.response.status}</Table.Cell>
                          </Table.Row>

                          <Table.Row>
                            <Table.Cell>Time</Table.Cell>
                            <Table.Cell>
                              {formatDateTime(selected.createdAt)}
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>IP Address</Table.Cell>
                            <Table.Cell>{selected.request.ip}</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>

                      {selected.response.body && (
                        <>
                          <h2>Response Body</h2>
                          <CodeBlock
                            language="json"
                            value={JSON.stringify(
                              selected.response.body,
                              null,
                              '\t'
                            )}
                          />
                        </>
                      )}
                    </Grid.Column>
                  )}
                </Grid.Row>
              </Grid>
              <Divider hidden />
              <SearchProvider.Pagination />
            </React.Fragment>
          );
        }}
      </SearchProvider>
    );
  }
}

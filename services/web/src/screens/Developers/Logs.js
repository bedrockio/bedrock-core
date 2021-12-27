import React from 'react';
import { Message, Divider, Loader, Label, Grid, Table } from 'semantic';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import { Layout } from 'components';
import { SearchProvider, Filters } from 'components/search';
import Menu from './Menu';
import SearchDropdown from 'components/SearchDropdown';
import { formatDateTime } from 'utils/date';

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
    const { loading, selectedItem } = this.state;

    if (loading) {
      return <Loader active />;
    }

    return (
      <SearchProvider limit={15} onDataNeeded={this.onDataNeeded}>
        {({ items, getSorted, setSort, reload, loading, error }) => {
          return (
            <React.Fragment>
              <Menu />
              <h1>Logs for Web</h1>
              <Layout horizontal center spread>
                <Layout.Group>
                  <Filters.Search
                    name="keyword"
                    placeholder="Filter by Request Id"
                  />
                </Layout.Group>
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
                      <Message>No applications created yet</Message>
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
                  {selectedItem && (
                    <Grid.Column width={8}>
                      <h2
                        style={{
                          marginTop: '-1rem',
                        }}>
                        {selectedItem.request.method} {selectedItem.request.url}
                      </h2>
                      <Table definition>
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell>Status</Table.Cell>
                            <Table.Cell>
                              {selectedItem.response.status}
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>Request Id</Table.Cell>
                            <Table.Cell>{selectedItem.requestId}</Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>Time</Table.Cell>
                            <Table.Cell>
                              {formatDateTime(selectedItem.createdAt)}
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>IP Address</Table.Cell>
                            <Table.Cell>{selectedItem.request.ip}</Table.Cell>
                          </Table.Row>
                        </Table.Body>
                      </Table>
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

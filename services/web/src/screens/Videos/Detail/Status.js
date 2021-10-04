import React from 'react';
import { Table, Loader, Message, Divider, Button } from 'semantic';
import { screen } from 'helpers';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import Menu from './Menu';

import { Layout } from 'components/Layout';

@screen
export default class VideoStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      status: null,
    };
  }

  componentDidMount() {
    this.fetchStatus();
  }

  fetchStatus = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { video } = this.props;
      const { data } = await request({
        method: 'GET',
        path: `/1/videos/${video.id}/status`,
      });
      this.setState({
        status: data,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  deleteAllJobs = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { video } = this.props;
      await request({
        method: 'DELETE',
        path: `/1/videos/${video.id}/transcode`,
      });
      this.setState({
        jobs: [],
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { video } = this.props;
    const { loading, error, status } = this.state;
    return (
      <React.Fragment>
        <Menu {...this.props} />
        {loading && <Loader active />}
        {error && <Message content={error.message} negative />}
        <Divider hidden />
        {video.provider === 'gcloud' && (
          <React.Fragment>
            <Button size="tiny" onClick={this.deleteAllJobs} negative>
              Clear All Jobs
            </Button>
            {status.jobs.length > 0 ? (
              <React.Fragment>
                <h2>GCloud Transcoder Jobs</h2>
                <Layout horizontal right></Layout>
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>ID</Table.HeaderCell>
                      <Table.HeaderCell>State</Table.HeaderCell>
                      <Table.HeaderCell>Started</Table.HeaderCell>
                      <Table.HeaderCell>Ended</Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {status.jobs.map((job) => {
                      const split = job.name.split('/');
                      const id = split[split.length - 1];
                      return (
                        <Table.Row key={id}>
                          <Table.Cell>{id}</Table.Cell>
                          <Table.Cell>
                            <p>{job.state}</p>
                            {job.error && (
                              <p style={{ 'word-break': 'break-all' }}>
                                {job.error.message}
                              </p>
                            )}
                          </Table.Cell>
                          <Table.Cell>
                            {job.createTime &&
                              formatDateTime(
                                new Date(job.createTime.seconds * 1000)
                              )}
                          </Table.Cell>
                          <Table.Cell>
                            {job.endTime &&
                              formatDateTime(
                                new Date(job.endTime.seconds * 1000)
                              )}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              </React.Fragment>
            ) : (
              <p>No jobs!</p>
            )}
          </React.Fragment>
        )}
        {video.provider === 'mux' && (
          <React.Fragment>
            <h2>Mux Asset</h2>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(status, null, 2)}
            </pre>
          </React.Fragment>
        )}
        {video.provider === 'vimeo' && (
          <React.Fragment>
            <h2>Vimeo Upload</h2>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(status, null, 2)}
            </pre>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

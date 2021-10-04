import React from 'react';
import { Table, Button, Message, Confirm } from 'semantic';
import { formatDateTime } from 'utils/date';
import { request } from 'utils/api';
import { screen } from 'helpers';
import { HelpTip, Breadcrumbs, SearchProvider, Layout } from 'components';
import { Link } from 'react-router-dom';

import Filters from 'modals/Filters';
import EditVideo from 'modals/EditVideo';

@screen
export default class VideoList extends React.Component {
  onDataNeeded = async (params) => {
    return await request({
      method: 'POST',
      path: '/1/videos/search',
      body: params,
    });
  };

  render() {
    return (
      <SearchProvider onDataNeeded={this.onDataNeeded}>
        {({
          items: videos,
          getSorted,
          setSort,
          filters,
          setFilters,
          reload,
        }) => {
          return (
            <React.Fragment>
              <Breadcrumbs active="Videos" />
              <Layout horizontal center spread>
                <h1>Videos</h1>
                <Layout.Group>
                  <Filters onSave={setFilters} filters={filters}>
                    <Filters.Text name="name" label="Name" />
                  </Filters>
                  <EditVideo
                    trigger={<Button primary content="New Video" icon="plus" />}
                    onSave={reload}
                  />
                </Layout.Group>
              </Layout>
              {videos.length === 0 ? (
                <Message>No videos created yet</Message>
              ) : (
                <Table celled sortable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}
                      >
                        Name
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => setSort('provider')}
                        sorted={getSorted('provider')}
                      >
                        Provider
                      </Table.HeaderCell>
                      <Table.HeaderCell
                        onClick={() => setSort('createdAt')}
                        sorted={getSorted('createdAt')}
                      >
                        Created
                        <HelpTip
                          title="Created"
                          text="This is the date and time the video was created."
                        />
                      </Table.HeaderCell>
                      <Table.HeaderCell textAlign="center">
                        Actions
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {videos.map((video) => {
                      return (
                        <Table.Row key={video.id}>
                          <Table.Cell>
                            <Link to={`/videos/${video.id}`}>{video.name}</Link>
                          </Table.Cell>
                          <Table.Cell>{video.provider}</Table.Cell>
                          <Table.Cell>
                            {formatDateTime(video.createdAt)}
                          </Table.Cell>
                          <Table.Cell textAlign="center" singleLine>
                            <EditVideo
                              video={video}
                              trigger={<Button basic icon="edit" />}
                              onSave={reload}
                            />
                            <Confirm
                              negative
                              confirmButton="Delete"
                              header={`Are you sure you want to delete "${video.name}"?`}
                              content="All data will be permanently deleted"
                              trigger={<Button basic icon="trash" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'DELETE',
                                  path: `/1/videos/${video.id}`,
                                });
                                reload();
                              }}
                            />
                            <Confirm
                              negative
                              confirmButton="Transcode"
                              header={`Start transcoding job for "${video.name}"?`}
                              content="Transcoding may take some time. You can check on the job status in the jobs tab."
                              trigger={<Button basic icon="sync-alt" />}
                              onConfirm={async () => {
                                await request({
                                  method: 'POST',
                                  path: `/1/videos/${video.id}/transcode`,
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
            </React.Fragment>
          );
        }}
      </SearchProvider>
    );
  }
}

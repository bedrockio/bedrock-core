import React from 'react';
import { Button, Segment, Header } from 'semantic';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import EditApplication from 'modals/EditApplication';

import { Breadcrumbs } from 'components';
import { APP_NAME } from 'utils/env';

@screen
export default class GettingStarted extends React.Component {
  state = {
    applications: [],
  };

  componentDidMount() {
    this.fetchApplications();
  }

  fetchApplications = async (params) => {
    const { category, ...rest } = params;
    return await request({
      method: 'POST',
      path: '/1/applications/mine/search',
      body: {
        ...rest,
        ...(category && { categories: [category.id] }),
      },
    });
  };

  render() {
    const { applications } = this.state;

    return (
      <>
        <Breadcrumbs active="Developer" />
        <Segment>
          <h2>Your integrations</h2>
        </Segment>

        {!applications.length && (
          <div>
            <h3>Get started with {APP_NAME}</h3>

            <Segment>
              <Header icon>Create an application</Header>
              <p>An application will allow you to do API requests</p>
              <Segment.Inline>
                <EditApplication
                  trigger={<Button primary>Create application</Button>}
                  onSave={() => {
                    this.setState({
                      application,
                    });
                  }}
                />
              </Segment.Inline>
            </Segment>
            <Segment style={{ padding: '1em' }}>
              <h4>Access the Api</h4>
            </Segment>
            <div style={{ padding: '1em' }}>
              <h4>3. See the Logs</h4>
              <p></p>
            </div>
            <div style={{ padding: '1em' }}>
              <h4>4. Exlore the logs</h4>
              <p></p>
            </div>
          </div>
        )}
      </>
    );
  }
}

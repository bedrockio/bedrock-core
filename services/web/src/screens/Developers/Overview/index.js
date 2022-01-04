import React from 'react';
import { Button, Segment, Header } from 'semantic';
import { request } from 'utils/api';
import screen from 'helpers/screen';
import EditApplication from 'modals/EditApplication';

import { Breadcrumbs } from 'components';
import { APP_NAME } from 'utils/env';

@screen
export default class Applications extends React.Component {
  state = {
    applications: [],
  };
  componentDidMount() {
    this.fetchApplications();
  }

  fetchApplications = async () => {
    return await request({
      method: 'POST',
      path: '/1/applications/mine/search',
    });
  };

  render() {
    const { applications } = this.state;

    return (
      <>
        <Breadcrumbs active="Developer" />
        <Segment>
          <h2>
            Your integrations <br /> Display some overview for each application,
            perhaps a heatbeat chart using the last 100 requests or something
            simple. <br />
            Or perhaps just show the error count + request count.
          </h2>
        </Segment>

        {!applications.length && (
          <div>
            <p>
              If yo dont have any applications this little wizard should get you
              going in 4 steps. <br />
              Create application. <br />
              Show a curl request to trigger an api request + pull for new
              requests <br />
              Once a request has been triggered show the logs <br />
            </p>

            <h3>Get started with {APP_NAME}</h3>

            <Segment>
              <Header icon>Create an application</Header>
              <p>An application will allow you to do API requests</p>
              <Segment.Inline>
                <EditApplication
                  trigger={<Button primary>Create application</Button>}
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

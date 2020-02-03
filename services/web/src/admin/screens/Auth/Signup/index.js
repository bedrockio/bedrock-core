import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import { observer, inject } from 'mobx-react';
import PageCenter from 'admin/components/PageCenter';
import LogoTitle from 'admin/components/LogoTitle';

import Form from './Form';
import { Link } from 'react-router-dom';

@inject('auth', 'routing')
@observer
export default class Signup extends React.Component {
  handleOnSubmit = (body) => {
    return this.props.auth.register(body, 'register').then(() => {
      this.props.routing.push('/admin/');
    });
  };

  render() {
    const status = this.props.auth.getStatus('register');
    return (
      <PageCenter>
        <LogoTitle title="Create your account" />
        <Segment.Group>
          <Segment padded>
            <Form onSubmit={this.handleOnSubmit} status={status} />
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={12}>
                Already have an account? <Link to="/admin/login">Login</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </PageCenter>
    );
  }
}

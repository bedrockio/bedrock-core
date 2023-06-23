import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Segment } from 'semantic';

import screen from 'helpers/screen';
import { withBasicLayout } from 'layouts/Basic';
import { withSession } from 'stores/session';

import LogoTitle from 'components/LogoTitle';

import { request } from 'utils/api';

import Form from './Form';

@screen
@withSession
@withBasicLayout
export default class Signup extends React.Component {
  state = {
    error: null,
    loading: false,
  };

  componentDidMount() {
    if (this.context.isLoggedIn()) {
      this.props.history.push('/');
    }
  }

  onSubmit = async (body) => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: '/1/auth/register',
        body,
      });
      this.props.history.push(await this.context.authenticate(data.token));
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { error, loading } = this.state;
    return (
      <React.Fragment>
        <LogoTitle title="Create your account" />
        <Segment.Group>
          <Segment padded>
            <Form onSubmit={this.onSubmit} error={error} loading={loading} />
          </Segment>
          <Segment secondary>
            <Grid>
              <Grid.Column floated="left" width={12}>
                Already have an account? <Link to="/login">Login</Link>
              </Grid.Column>
            </Grid>
          </Segment>
        </Segment.Group>
      </React.Fragment>
    );
  }
}

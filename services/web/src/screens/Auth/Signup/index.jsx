import React from 'react';
import { Segment, Grid } from 'semantic';
import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';
import { withSession } from 'stores';
import { request } from 'utils/api';
//import screen from 'helpers/screen';

import Form from './Form';
import { Link } from 'react-router-dom';

class Signup extends React.Component {
  static layout = 'none';

  state = {
    error: null,
    loading: false,
  };

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
      this.context.setToken(data.token);
      await this.context.load();
      this.props.history.push('/');
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
      <PageCenter>
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
      </PageCenter>
    );
  }
}

export default withSession(Signup);

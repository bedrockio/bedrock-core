import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';
import inject from 'stores/inject';

import Form from './Form';
import { Link } from 'react-router-dom';

@inject('auth')
export default class Signup extends React.Component {

  state = {
    error: null,
    loading: false,
  }

  onSubmit = async (body) => {
    try {
      await this.context.auth.register(body);
      this.props.history.push('/');
    } catch(error) {
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

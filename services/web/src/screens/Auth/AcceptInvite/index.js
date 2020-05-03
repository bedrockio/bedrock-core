import React from 'react';
import { Segment, Grid } from 'semantic-ui-react';
import { observer, inject } from 'mobx-react';
import PageCenter from 'components/PageCenter';
import LogoTitle from 'components/LogoTitle';

import Form from './Form';
import { Link } from 'react-router-dom';
import { getToken, parseToken } from 'utils/token';

@inject('auth', 'routing')
@observer
export default class AcceptInvite extends React.Component {
  constructor(props) {
    super(props);
    const token = getToken(props);
    const parsedToken = token && parseToken(token);
    this.state = {
      token,
      jwt: parsedToken
    };
  }

  onSubmit = (body) => {
    this.setState({ initialValues: body });
    return this.props.auth
      .acceptInvite({ ...body, token: this.state.token }, 'accepInvite')
      .then(() => {
        this.props.routing.push('/');
      });
  };

  render() {
    const status = this.props.auth.getStatus('accepInvite');
    const { jwt } = this.state;
    return (
      <PageCenter>
        <LogoTitle title="Accept Invite" />
        <Segment.Group>
          <Segment padded>
            <div className="wrapper">
              <p>This invite is intented for {jwt.email}</p>
              <Form onSubmit={this.onSubmit} status={status} />
            </div>
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

import React from 'react';

import { Message, Modal, Button } from 'semantic';

import { JWT_KEY, request } from 'utils/api';

import modal from 'helpers/modal';

@modal
export default class LoginAsUser extends React.Component {
  static defaultProps = {
    initialValues: {},
  };

  state = {
    loading: false,
    user: this.props.user,
  };

  onConfigure = async () => {
    const { user } = this.props;
    this.setState({
      loading: true,
      error: null,
    });
    try {
      const { data } = await request({
        method: 'POST',
        path: `/1/users/${user.id}/authenticate`,
      });
      this.setState({
        token: data.token,
      });
    } catch (error) {
      this.setState({ error, loading: false });
    }
  };

  onStart = () => {
    const tab = window.open(`/`, '_blank');
    tab.sessionStorage.setItem(JWT_KEY, this.state.token);
    this.props.close();
  };

  render() {
    const { error, user, loading = false, token } = this.state;
    const isReady = !!token;
    return (
      <>
        <Modal.Header>Login As User</Modal.Header>
        <Modal.Content>
          {error && <Message error content={error.message} />}
          <p>
            Are you sure you want to log in as {user.email}? The session will be
            valid for 2 hours only.
          </p>
        </Modal.Content>
        <Modal.Actions>
          {!isReady && (
            <>
              <Button
                style={{ marginLeft: 0 }}
                primary
                fluid
                loading={loading}
                onClick={this.onConfigure}>
                Authenticate
              </Button>
            </>
          )}

          {isReady && (
            <>
              <p style={{ textAlign: 'center' }}>
                Click below to start the session in a new tab. Only that tab
                will be authenticated as the user. Close the tab to end the
                session.
              </p>

              <Button
                style={{ marginLeft: 0 }}
                basic={!token}
                primary={token}
                fluid
                onClick={this.onStart}>
                Open window
              </Button>
            </>
          )}
          <br />
        </Modal.Actions>
      </>
    );
  }
}

import React from 'react';
import { request } from 'utils/api';

import { Message, Modal, Button } from 'semantic';
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

  onConfirm = async () => {
    const { user } = this.props;
    this.setState({
      loading: true,
      error: null,
    });
    try {
      const { data } = await request({
        method: 'GET',
        path: `/1/users/${user.id}/token`,
      });

      window.localStorage.setItem('tmpToken', data.token);
      window.open(`?tmpToken=true`, '_blank');
      this.props.close();
    } catch (error) {
      this.setState({ error, loading: false });
    }
  };

  render() {
    const { error, user, loading } = this.state;
    return (
      <>
        <Modal.Header>Login As User</Modal.Header>
        <Modal.Content>
          {error && <Message error content={error.message} />}
          Are you sure you want to log in as {user.email}? The current admin
          login session will be terminated (incognito session recommended). The
          session will be valid for 2 hours only.
        </Modal.Content>
        <Modal.Actions>
          <Button
            basic
            content="Cancel"
            onClick={() =>
              this.setState({
                open: false,
              })
            }
          />
          <Button
            loading={loading}
            primary
            content="Start Auth Session"
            onClick={this.onConfirm}
          />
        </Modal.Actions>
      </>
    );
  }
}

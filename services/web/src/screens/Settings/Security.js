import React from 'react';
import { Segment, Message, Form, Button, Divider } from 'semantic';
import { screen } from 'helpers';
import Menu from './Menu';
import { request } from 'utils/api';

import { withSession } from 'stores';

@withSession
@screen
export default class Account extends React.Component {
  state = {
    user: this.context.user,
  };

  setField = (evt, { name, value }) => {
    this.setState({
      user: {
        ...this.state.user,
        [name]: value,
      },
    });
  };

  setCheckedField = (evt, { name, checked }) => {
    this.setField(evt, { name, value: checked });
  };

  async save() {
    const { user } = this.state;
    try {
      this.setState({
        loading: true,
        error: null,
      });
      const { data } = await request({
        method: 'PATCH',
        path: `/1/users/me`,
        body: user,
      });
      this.context.updateUser(data);
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  render() {
    const { user, error, loading } = this.state;
    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
        {error && <Message error content={error.message} />}
        <Form onSubmit={() => this.save()}>
          <Segment>
            <Form.Input
              type="text"
              name="name"
              label="Full Name"
              value={user.name || ''}
              onChange={this.setField}
            />

            <Form.Input
              type="text"
              name="email"
              label="E-Mail"
              value={user.email || ''}
              onChange={this.setField}
            />
          </Segment>
          <Button primary content="Save" loading={loading} disabled={loading} />
        </Form>
      </React.Fragment>
    );
  }
}

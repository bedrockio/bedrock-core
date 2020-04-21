import React from 'react';
import { observer, inject } from 'mobx-react';

import { Button, Form, TextArea, Modal } from 'semantic-ui-react';
import { emailRegexp } from 'utils/validate';
import AutoFocus from 'components/AutoFocus';

const defaultState = () => {
  return {
    open: false,
    validEmails: [],
    invalidEmails: [],
    touched: false
  };
};

@inject('invites')
@observer
export default class InviteForm extends React.Component {
  state = {
    validEmails: [],
    invalidEmails: []
  };

  handleTextAreaChange = (e, { value }) => {
    const values = value
      .toLowerCase()
      .split(/[\s,;\t\n]+/)
      .map((str) => str.trim())
      .filter(Boolean);

    const validEmails = [];
    const invalidEmails = [];
    values.forEach((text) => {
      if (text.match(emailRegexp)) {
        validEmails.push(text);
      } else {
        invalidEmails.push(text);
      }
    });
    this.setState({
      validEmails,
      invalidEmails
    });
  };

  handleSubmit = () => {
    this.setState({
      touched: true
    });

    return this.props.invites
      .create({ emails: this.state.validEmails })
      .then((err) => {
        if (err instanceof Error) return;
        this.setState(defaultState());
      });
  };

  render() {
    const { validEmails, open } = this.state;
    const { invites, trigger, ...rest } = this.props;

    const status = invites.getStatus('create');

    return (
      <Modal
        closeIcon
        onClose={() => this.setState(defaultState())}
        onOpen={() => this.setState({ open: true })}
        open={open}
        trigger={trigger}
        {...rest}
      >
        <Modal.Header>Invite User</Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form onSubmit={this.handleSubmit} className={this.props.className}>
              <Form.Field>
                <label>Enter email address of the participant to invite</label>
                <TextArea
                  style={{ height: '150px' }}
                  name="emails"
                  onChange={this.handleTextAreaChange}
                  placeholder="Email address seperate by comma or newline .e.g first@gmail.com, second@gmail.com"
                />
              </Form.Field>
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button basic onClick={this.props.onClose}>
            Close
          </Button>
          <Button
            onClick={this.handleSubmit}
            primary
            disabled={validEmails.length === 0}
            loading={status.request}
            type="submit"
          >
            Invite Members {validEmails.length ? `(${validEmails.length})` : ''}
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

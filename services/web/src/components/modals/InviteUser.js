import React from 'react';
import { Button, Form, TextArea, Modal, Message } from 'semantic-ui-react';
import inject from 'stores/inject';

import { emailRegexp } from 'utils/validate';
import AutoFocus from 'components/AutoFocus';

@inject('invites')
export default class InviteForm extends React.Component {

  static defaultProps = {
    onSave: () => {},
  };

  state = {
    open: false,
    loading: false,
    touched: false,
    validEmails: [],
    invalidEmails: [],
  };

  onChange = (e, { value }) => {
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
      invalidEmails,
      touched: false,
    });
  };

  onSubmit = async () => {
    this.setState({
      touched: true,
    });
    try {
      const { validEmails } = this.state;
      await this.context.invites.create({ emails: validEmails });
      this.setState({
        open: false,
        loading: false,
        touched: false,
        validEmails: [],
        invalidEmails: [],
      });
      this.props.onSave();
    } catch(error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { open, loading, touched, validEmails, invalidEmails } = this.state;
    const { onSave, ...rest } = this.props;
    return (
      <Modal
        closeIcon
        onOpen={() => this.setState({ open: true })}
        onClose={() => this.setState({ open: false })}
        open={open}
        {...rest}>
        <Modal.Header>Invite User</Modal.Header>
        <Modal.Content>
          <AutoFocus>
            <Form onSubmit={this.onSubmit} className={this.props.className}>
              <Form.Field>
                <label>Enter email address of the participant to invite</label>
                <TextArea
                  style={{ height: '150px' }}
                  name="emails"
                  onBlur={() => this.setState({ touched: true })}
                  onChange={this.onChange}
                  placeholder="Email address seperate by comma or newline .e.g first@gmail.com, second@gmail.com"
                />
              </Form.Field>
              {touched && invalidEmails.length > 0 && (
                <Message negative>
                 Invalid: {invalidEmails.join(', ')}
                </Message>
              )}
            </Form>
          </AutoFocus>
        </Modal.Content>
        <Modal.Actions>
          <Button basic onClick={() => this.setState({ open: false })}>
            Close
          </Button>
          <Button
            onClick={this.onSubmit}
            primary
            disabled={validEmails.length === 0}
            loading={loading}
            type="submit">
            Invite Members {validEmails.length ? `(${validEmails.length})` : ''}
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

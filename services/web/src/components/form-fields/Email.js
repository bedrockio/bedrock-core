import React from 'react';
import PropTypes from 'prop-types';

import { Form, Input, Message } from 'semantic';

export default class EmailField extends React.Component {
  render() {
    const { error, ...rest } = this.props;
    return (
      <Form.Field error={error?.hasField?.('email')}>
        <Input
          name="email"
          type="email"
          icon="envelope"
          iconPosition="left"
          placeholder="Email Address"
          autoComplete="email"
          {...rest}
        />
        {this.renderFieldErrors()}
      </Form.Field>
    );
  }

  renderFieldErrors() {
    const { error } = this.props;
    const details = error?.getFieldDetails?.('email');
    if (details) {
      return (
        <React.Fragment>
          <Message size="small" error>
            <Message.Content>
              {details.map((d, i) => {
                return <div key={i}>{d.message}</div>;
              })}
            </Message.Content>
          </Message>
        </React.Fragment>
      );
    }
  }
}

EmailField.propTypes = {
  error: PropTypes.instanceOf(Error),
};

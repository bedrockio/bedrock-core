import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Icon, Message } from 'semantic';

export default class PasswordField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  getType() {
    const { show } = this.state;
    return show ? 'text' : 'password';
  }

  toggle = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  render() {
    const { error, current, ...rest } = this.props;
    const { show } = this.state;
    return (
      <Form.Field error={error?.hasField?.('password')}>
        <Input
          name="password"
          icon={true}
          iconPosition="left"
          placeholder="Password"
          autoComplete={current ? 'current-password' : 'new-password'}
          {...rest}
          type={this.getType()}>
          <Icon name="lock" />
          <input />
          <Icon
            name={show ? 'eye' : 'eye-slash'}
            style={{
              position: 'absolute',
              pointerEvents: 'auto',
              cursor: 'pointer',
              top: '50%',
              right: '0',
              left: 'auto',
              bottom: 'auto',
              padding: '15px',
              background: 'none',
              border: 'none',
            }}
            onClick={this.toggle}
          />
        </Input>
        {this.renderFieldErrors()}
      </Form.Field>
    );
  }

  renderFieldErrors() {
    const { error } = this.props;
    const details = error?.getFieldDetails?.('password');
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

PasswordField.propTypes = {
  current: PropTypes.bool,
  error: PropTypes.instanceOf(Error),
};

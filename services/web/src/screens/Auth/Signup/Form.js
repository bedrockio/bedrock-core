import React from 'react';
import { Form, Input, Button, Checkbox, Message } from 'semantic';
import AutoFocus from 'components/AutoFocus';

export default (props) => {
  const { error, loading } = props;

  const [touched, setTouched] = React.useState(false);

  const [fields, setFields] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    accepted: false,
  });

  function setField(name, value) {
    setFields({ ...fields, ...{ [name]: value } });
  }

  return (
    <AutoFocus>
      <Form
        error={touched}
        size="large"
        onSubmit={() => {
          setTouched(true);
          const { accepted, ...rest } = fields;
          if (!accepted) return;

          props.onSubmit(rest);
        }}>
        {touched && !fields.accepted && (
          <Message error content="Please accept the terms of service" />
        )}
        {error && <Message error content={error.message} />}
        <Form.Field error={error?.hasField?.('firstName')}>
          <Input
            value={fields.firstName}
            name="firstName"
            placeholder="First Name"
            type="text"
            autoComplete="name"
            onChange={(e, { value, name }) => setField(name, value)}
          />
        </Form.Field>
        <Form.Field error={error?.hasField?.('lastName')}>
          <Input
            value={fields.lastName}
            name="lastName"
            placeholder="Last Name"
            type="text"
            autoComplete="name"
            onChange={(e, { value, name }) => setField(name, value)}
          />
        </Form.Field>
        <Form.Field error={error?.hasField?.('email')}>
          <Input
            value={fields.email}
            name="email"
            icon="mail"
            iconPosition="left"
            placeholder="E-mail Address"
            type="email"
            autoComplete="email"
            onChange={(e, { value, name }) => setField(name, value)}
          />
        </Form.Field>
        <Form.Field error={error?.hasField?.('password')}>
          <Input
            value={fields.password}
            icon="lock"
            name="password"
            iconPosition="left"
            placeholder="Password"
            autoComplete="new-password"
            type="password"
            onChange={(e, { value, name }) => setField(name, value)}
          />
        </Form.Field>
        <Form.Field error={touched && !fields.accepted}>
          <Checkbox
            name="accepted"
            label={
              <label>
                I accept the <a href="/terms">Terms of Service</a>.
              </label>
            }
            checked={fields.accepted}
            onChange={(e, { checked, name }) => setField(name, checked)}
          />
        </Form.Field>
        <Form.Button
          fluid
          primary
          size="large"
          content="Signup"
          loading={loading}
          disabled={loading}
        />
      </Form>
    </AutoFocus>
  );
};

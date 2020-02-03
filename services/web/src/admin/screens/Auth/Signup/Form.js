import React from 'react';
import { Form, Input, Button, Checkbox, Message } from 'semantic-ui-react';
import AutoFocus from 'admin/components/AutoFocus';

export default (props) => {
  const { status } = props;
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [accepted, setAccepted] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  return (
    <AutoFocus>
      <Form
        error={touched}
        size="large"
        onSubmit={() => {
          setTouched(true);
          if (!accepted) return;

          props.onSubmit({
            name,
            email,
            password
          });
        }}
      >
        {touched && !accepted && (
          <Message error content="Please accept the terms of service" />
        )}
        {status.error && <Message error content={status.error.message} />}
        <Form.Field error={touched && !name.length}>
          <Input
            value={name}
            onChange={(e, { value }) => setName(value)}
            icon="user"
            iconPosition="left"
            placeholder="Full Name"
            type="text"
            autoComplete="name"
          />
        </Form.Field>

        <Form.Field error={touched && !email.length}>
          <Input
            value={email}
            onChange={(e, { value }) => setEmail(value)}
            icon="mail"
            iconPosition="left"
            placeholder="E-mail Address"
            type="email"
            autoComplete="email"
          />
        </Form.Field>

        <Form.Field error={touched && !password.length}>
          <Input
            value={password}
            onChange={(e, { value }) => setPassword(value)}
            icon="lock"
            iconPosition="left"
            placeholder="Password"
            autoComplete="new-password"
            type="password"
          />
        </Form.Field>

        <Form.Field error={touched && !accepted}>
          <Checkbox
            label={
              <label>
                I accept the <a href="/terms">Terms of Service</a>.
              </label>
            }
            checked={accepted}
            onChange={(e, { checked }) => setAccepted(checked)}
          />
        </Form.Field>

        <Button
          primary
          size="large"
          content="Signup"
          loading={status.request}
        />
      </Form>
    </AutoFocus>
  );
};

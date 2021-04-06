import React from 'react';
import { Form, Input, Button, Message } from 'semantic';
import AutoFocus from 'components/AutoFocus';

export default (props) => {
  const { error, loading } = props;
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  return (
    <AutoFocus>
      <Form
        error={!!error}
        size="large"
        onSubmit={() => {
          props.onSubmit({
            email,
            password,
          });
        }}>
        {error && <Message error content={error.message} />}
        <Form.Field error={error?.hasField?.('email')}>
          <Input
            value={email}
            onChange={(e, { value }) => setEmail(value)}
            name="email"
            icon="mail"
            iconPosition="left"
            placeholder="E-mail Address"
            type="email"
            autoComplete="email"
          />
        </Form.Field>
        <Form.Field error={error?.hasField?.('password')}>
          <Input
            value={password}
            onChange={(e, { value }) => setPassword(value)}
            name="password"
            icon="lock"
            iconPosition="left"
            placeholder="Password"
            autoComplete="current-password"
            type="password"
          />
        </Form.Field>
        <Button
          fluid
          primary
          size="large"
          content="Login"
          loading={loading}
          disabled={loading}
        />
      </Form>
    </AutoFocus>
  );
};

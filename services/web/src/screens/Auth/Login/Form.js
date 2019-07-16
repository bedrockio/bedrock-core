import React from 'react';
import { Form, Input, Button, Message } from 'semantic-ui-react';
import AutoFocus from 'components/AutoFocus';

export default (props) => {
  const { status } = props;
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  return (
    <AutoFocus>
      <Form
        error={touched}
        size="large"
        onSubmit={() => {
          setTouched(true);

          props.onSubmit({
            email,
            password
          });
        }}
      >
        {status.error && <Message error content={status.error.message} />}

        <Form.Field error={touched && !email.length}>
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

        <Form.Field error={touched && !password.length}>
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
          loading={status.request}
        />
      </Form>
    </AutoFocus>
  );
};

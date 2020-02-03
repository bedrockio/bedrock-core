import React from 'react';
import { Form, Button, Message } from 'semantic-ui-react';
import AutoFocus from 'components/AutoFocus';

export default (props) => {
  const { status } = props;
  const [password, setPassword] = React.useState('');
  const [repeat, setRepeat] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  return (
    <AutoFocus>
      <Form
        error={touched}
        size="large"
        onSubmit={() => {
          setTouched(true);

          if (repeat !== password) return;

          props.onSubmit({
            password
          });
        }}
      >
        {status.error && <Message error content={status.error.message} />}

        <Form.Input
          name="password"
          icon="lock"
          iconPosition="left"
          placeholder="New Password"
          autoComplete="new-password"
          type="password"
          value={password}
          onChange={(e, { value }) => setPassword(value)}
        />

        <Form.Input
          error={touched && repeat !== password}
          name="password"
          icon="lock"
          iconPosition="left"
          placeholder="Repeat Password"
          autoComplete="new-password"
          type="password"
          value={repeat}
          onChange={(e, { value }) => setRepeat(value)}
        />

        <Button
          fluid
          primary
          size="large"
          content="Reset Password"
          loading={status.request}
        />
      </Form>
    </AutoFocus>
  );
};

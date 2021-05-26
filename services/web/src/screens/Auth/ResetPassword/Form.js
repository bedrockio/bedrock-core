import React from 'react';
import { Form, Button, Message } from 'semantic';
import AutoFocus from 'components/AutoFocus';

export default (props) => {
  const { loading, error } = props;
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
          props.onSubmit({
            password,
            repeat,
          });
        }}>
        {error && <Message error content={error.message} />}
        <Form.Input
          name="password"
          icon="lock"
          iconPosition="left"
          placeholder="New Password"
          autoComplete="new-password"
          type="password"
          value={password}
          onChange={(e, { value }) => setPassword(value)}
          error={error?.hasField?.('password') || (touched && !password)}
        />

        <Form.Input
          error={touched && (!repeat || repeat !== password)}
          name="repeat"
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
          loading={loading}
        />
      </Form>
    </AutoFocus>
  );
};

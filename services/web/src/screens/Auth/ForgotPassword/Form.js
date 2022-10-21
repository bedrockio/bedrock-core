import React from 'react';
import { Form, Button } from 'semantic';
import AutoFocus from 'components/AutoFocus';

export default (props) => {
  const { error, loading } = props;
  const [email, setEmail] = React.useState('');
  return (
    <AutoFocus>
      <Form
        error={!!error}
        size="large"
        onSubmit={() => {
          props.onSubmit({
            email,
          });
        }}>
        <Form.Input
          name="email"
          icon="envelope"
          iconPosition="left"
          placeholder="E-mail Address"
          type="text"
          autoComplete="email"
          onChange={(e, { value }) => setEmail(value)}
          error={error?.hasField?.('email')}
        />
        <Button
          fluid
          primary
          size="large"
          content="Request password"
          loading={loading}
          disabled={loading}
        />
      </Form>
    </AutoFocus>
  );
};

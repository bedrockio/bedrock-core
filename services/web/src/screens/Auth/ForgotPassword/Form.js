import React from 'react';
import { Form, Button } from 'semantic-ui-react';
import AutoFocus from 'components/AutoFocus';

export default (props) => {
  const [email, setEmail] = React.useState('');
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
          });
        }}>
        <Form.Input
          name="email"
          icon="mail"
          iconPosition="left"
          placeholder="E-mail Address"
          type="text"
          autoComplete="email"
          onChange={(e, { value }) => setEmail(value)}
        />

        <Button
          fluid
          primary
          size="large"
          content="Request password"
          loading={props.loading}
          disabled={props.loading}
        />
      </Form>
    </AutoFocus>
  );
};

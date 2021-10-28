import React from 'react';
import { Input, Form, Label } from 'semantic';

export default function Password({ label, required, value, ...props }) {
  const [show, toggle] = React.useState(false);

  return (
    <Form.Field required={required}>
      <label>{label}</label>
      <Input
        type={show ? 'text' : 'password'}
        labelPosition="right"
        value={value}
        label={
          <Label
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(!show);
              return false;
            }}
            content={show ? 'Hide' : 'Show'}
          />
        }
        {...props}
      />
    </Form.Field>
  );
}

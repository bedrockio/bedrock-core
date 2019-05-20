import React from 'react';
import { Form, Select } from 'semantic-ui-react';
import { getData } from 'country-list';

const countries = getData().map(({ code, name }) => ({
  value: code,
  text: name,
  key: code
}));

export default function Countries({
  required,
  label,
  placeholder = 'Country',
  name,
  ...props
}) {
  function handleChange(e, { value }) {
    return props.onChange(value);
  }

  return (
    <Form.Field required={required}>
      {label && <label>{label}</label>}
      <Select
        name={name}
        defaultValue={props.value}
        placeholder={placeholder}
        options={countries}
        onChange={handleChange}
      />
    </Form.Field>
  );
}

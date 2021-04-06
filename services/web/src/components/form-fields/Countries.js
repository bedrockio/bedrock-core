import React from 'react';
import { Form, Select } from 'semantic';
import { getData } from 'country-list';

const countries = getData().map(({ code, name }) => ({
  value: code,
  text: name,
  key: code,
}));

export default class Countries extends React.Component {
  render() {
    const { required, label, placeholder, value, name } = this.props;
    return (
      <Form.Field required={required}>
        {label && <label>{label}</label>}
        <Select
          search
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          options={countries}
          onChange={this.props.onChange}
        />
      </Form.Field>
    );
  }
}

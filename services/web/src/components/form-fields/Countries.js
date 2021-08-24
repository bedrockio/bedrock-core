import React from 'react';
import { Form, Select } from 'semantic';
import allCountries from 'utils/countries';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  text: nameEn,
  key: countryCode,
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
          value={value}
          placeholder={placeholder}
          options={[] || countries}
          onChange={this.props.onChange}
        />
      </Form.Field>
    );
  }
}

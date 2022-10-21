import React from 'react';
import { Form, Select } from '/semantic';

import allCountries from '/utils/countries';

const countries = allCountries.map(({ nameEn, callingCode }) => ({
  value: callingCode,
  text: `${nameEn} +${callingCode}`,
  key: callingCode,
}));

export default class PhoneCountryCode extends React.Component {
  render() {
    const {
      required,
      label = 'Country Code',
      placeholder,
      value,
      name,
    } = this.props;
    return (
      <Form.Field required={required}>
        {label && <label>{label}</label>}
        <Select
          search
          name={name}
          value={value}
          placeholder={placeholder}
          options={countries}
          onChange={this.props.onChange}
        />
      </Form.Field>
    );
  }
}

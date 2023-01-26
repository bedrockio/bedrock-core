import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/semantic-ui.css';

import React from 'react';
import { Form } from 'semantic';

export default class PhoneCountryCode extends React.Component {
  render() {
    const {
      required,
      label,
      name,
      placeholder,
      onChange = () => {},
    } = this.props;
    return (
      <Form.Field required={required}>
        {label && <label>{label}</label>}
        <PhoneInput
          inputProps={{
            name,
            required,
            style: {
              paddingLeft: '48px',
              height: 'auto',
            },
          }}
          country={placeholder ? [] : ['us']}
          placeholder={placeholder}
          onChange={(value, e, c) => {
            onChange(e, { name, value });
          }}
        />
      </Form.Field>
    );
  }
}

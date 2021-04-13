import { get, set } from 'lodash';
import React from 'react';
import { Form, Segment } from 'semantic';
import CountriesField from 'components/form-fields/Countries';

export default class Address extends React.Component {
  setField = (e, { name, value }) => {
    const currentValue = this.props.value || {};
    set(currentValue, name, value);
    this.props.onChange(e, { name: this.props.name, value: currentValue });
  };

  render() {
    const { value, label = 'Address' } = this.props;
    return (
      <>
        <h4>{label}</h4>
        <Segment>
          <Form.Input
            type="text"
            name="street"
            label="Street Name"
            value={get(value, 'street')}
            onChange={this.setField}
          />
          <Form.Input
            type="text"
            name="houseNumber"
            label="House Number"
            value={get(value, 'houseNumber')}
            onChange={this.setField}
          />
          <Form.Input
            type="text"
            name="city"
            label="City or Town"
            value={get(value, 'city')}
            onChange={this.setField}
          />
          <CountriesField
            label="Country Code"
            name="countryCode"
            value={get(value, 'countryCode')}
            onChange={this.setField}
          />
          <Form.Input
            type="text"
            name="stateOrProvince"
            label="State or Province"
            value={get(value, 'stateOrProvince')}
            onChange={this.setField}
          />
          <Form.Input
            type="text"
            name="postalCode"
            label="Postal Code or Zip Code"
            value={get(value, 'postalCode')}
            onChange={this.setField}
          />
        </Segment>
      </>
    );
  }
}

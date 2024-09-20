import React from 'react';
import { Form } from 'semantic';

export default class NumberField extends React.Component {
  onChange = (evt, { value, ...rest }) => {
    value = parseInt(value);
    if (isNaN(value)) {
      value = null;
    }
    this.props.onChange(evt, { ...rest, value });
  };

  render() {
    return (
      <Form.Input {...this.props} type="number" onChange={this.onChange} />
    );
  }
}

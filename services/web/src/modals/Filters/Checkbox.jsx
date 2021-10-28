import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';

export default class CheckboxFilter extends React.Component {
  onChange = (evt, { name, checked }) => {
    this.props.onChange(evt, { name, value: checked });
  };

  render() {
    const { name, value, onChange, ...rest } = this.props;
    return (
      <Form.Checkbox
        id={name}
        name={name}
        checked={!!value}
        onChange={this.onChange}
        {...rest}
      />
    );
  }
}

CheckboxFilter.propTypes = {
  ...Form.Input.propTypes,
  name: PropTypes.string.isRequired,
};

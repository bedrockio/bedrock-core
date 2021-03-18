import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';

export default class DropdownFilter extends React.Component {

  getDefaultOptions() {
    return this.props.value.map((val) => {
      return {
        text: val,
        value: val,
      };
    });
  }

  render() {
    const { name, options, ...rest } = this.props;
    return (
      <Form.Dropdown
        id={name}
        name={name}
        options={options || this.getDefaultOptions()}
        {...rest}
      />
    );
  }
}

DropdownFilter.propTypes = {
  ...Form.Dropdown.propTypes,
  name: PropTypes.string.isRequired,
};

DropdownFilter.defaultProps = {
  fluid: true,
  search: false,
  clearable: true,
  selection: true,
};

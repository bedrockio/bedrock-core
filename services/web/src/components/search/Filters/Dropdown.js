import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';
import SearchDropdown from 'components/SearchDropdown';

export default class DropdownFilter extends React.Component {
  getDefaultValue() {
    const { multiple } = this.props;
    return multiple ? [] : '';
  }

  getValue() {
    const { name } = this.props;
    return this.context.getFilterValue(name) || this.getDefaultValue();
  }

  getOptions() {
    let { options } = this.props;
    if (!options) {
      const value = this.getValue();
      const arr = Array.isArray(value) ? value : [value];
      return arr.map((value) => {
        return {
          value,
          text: value,
        };
      });
    }
  }

  render() {
    if (this.props.onDataNeeded) {
      const { label, disabled, error, ...rest } = this.props;
      return (
        <Form.Field disabled={disabled} error={error}>
          <label>{label}</label>
          <SearchDropdown
            value={this.getValue()}
            onChange={this.context.onFilterChange}
            {...rest}
          />
        </Form.Field>
      );
    } else {
      return (
        <Form.Dropdown
          value={this.getValue()}
          options={this.getOptions()}
          onChange={this.context.onFilterChange}
          {...this.props}
        />
      );
    }
  }
}

DropdownFilter.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

DropdownFilter.defaultProps = {
  fluid: true,
  search: false,
  clearable: true,
  selection: true,
};

import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';
import SearchDropdown from 'components/SearchDropdown';

import SearchContext from '../Context';

export default class DropdownFilter extends React.Component {
  static contextType = SearchContext;

  getDefaultValue() {
    const { multiple } = this.props;
    return multiple ? [] : '';
  }

  getValue() {
    const { name } = this.props;
    return this.context.filters[name] || this.getDefaultValue();
  }

  getOptions() {
    let { options } = this.props;
    if (!options) {
      const value = this.getValue();
      const arr = Array.isArray(value) ? value : [value];
      return arr.map((value) => {
        return {
          key: value,
          value,
          text: value,
        };
      });
    }
  }

  render() {
    if (this.props.onDataNeeded) {
      const { label, disabled, error, ...rest } = this.props;
      console.log('setting value', this.getValue());
      return (
        <Form.Field disabled={disabled} error={error}>
          <label>{label}</label>
          <SearchDropdown
            value={this.getValue()}
            onChange={(e, { name, value }) => {
              this.context.onFilterChange({
                value: value,
                name,
              });
            }}
            {...rest}
          />
        </Form.Field>
      );
    } else {
      return (
        <Form.Dropdown
          value={this.getValue()}
          options={this.getOptions()}
          onChange={(e, { value, name }) => {
            this.context.onFilterChange({
              value,
              name,
            });
          }}
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

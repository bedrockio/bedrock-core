import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';

import SearchDropdown from 'components/SearchDropdown';

import SearchContext from '../Context';
import { Select } from '@mantine/core';

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
      const { label, ...rest } = this.props;
      return (
        <SearchDropdown
          label={label}
          objectMode={false}
          value={this.getValue()}
          onChange={(value) => {
            this.context.onFilterChange({
              value: value,
              name: this.props.name,
            });
          }}
          {...rest}
        />
      );
    } else {
      return (
        <Select
          value={this.getValue()}
          options={this.getOptions()}
          onChange={(value) => {
            this.context.onFilterChange({
              value,
              name: this.props.name,
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

import { Select } from '@mantine/core';
import PropTypes from 'prop-types';
import React from 'react';

import SearchDropdown from 'components/SearchDropdown';

import SearchContext from '../Context';

export default class SelectFilter extends React.Component {
  static contextType = SearchContext;

  getDefaultValue() {
    const { multiple } = this.props;
    return multiple ? [] : '';
  }

  getValue() {
    const { name } = this.props;
    return this.context.filters[name] || this.getDefaultValue();
  }

  getData() {
    let { data } = this.props;
    if (!data) {
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
    return data;
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
          data={this.getData()}
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

SelectFilter.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

SelectFilter.defaultProps = {
  clearable: true,
};

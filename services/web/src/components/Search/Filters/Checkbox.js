import { Checkbox } from '@mantine/core';
import PropTypes from 'prop-types';
import React from 'react';

import SearchContext from '../Context';

export default class CheckboxFilter extends React.Component {
  static contextType = SearchContext;

  onChange = (evt) => {
    this.context.onFilterChange({
      value: evt.target.checked,
      name: this.props.name,
    });
  };

  render() {
    const { name, ...rest } = this.props;
    return (
      <Checkbox
        id={name}
        name={name}
        checked={this.context.filters[name] || false}
        onChange={this.onChange}
        {...rest}
      />
    );
  }
}

CheckboxFilter.propTypes = {
  ...Checkbox.propTypes,
  name: PropTypes.string.isRequired,
};

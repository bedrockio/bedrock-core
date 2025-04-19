import React from 'react';
import PropTypes from 'prop-types';

import SearchContext from '../Context';
import { NumberInput } from '@mantine/core';

export default class NumberFilter extends React.Component {
  static contextType = SearchContext;

  onChange = (value) => {
    this.context.onFilterChange({
      name: this.props.name,
      value: Number(value),
    });
  };

  render() {
    const { name, min, max } = this.props;
    const value = this.context.filters[name];
    return (
      <NumberInput
        id={name}
        type="number"
        min={min}
        max={max}
        icon={
          value != '' && {
            name: 'close',
            link: true,
            onClick: (evt) => {
              if (value) {
                this.context.onFilterChange({ name, value: '' });
              }
              evt.target.closest('.input').querySelector('input').focus();
            },
          }
        }
        value={value || ''}
        onChange={this.onChange}
        {...this.props}
      />
    );
  }
}

NumberFilter.propTypes = {
  ...NumberInput.propTypes,
  name: PropTypes.string.isRequired,
};

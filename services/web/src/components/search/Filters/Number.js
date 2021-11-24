import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';

import SearchContext from '../context';

export default class NumberFilter extends React.Component {
  static contextType = SearchContext;

  onChange = (evt, { value, ...rest }) => {
    this.context.onFilterChange(evt, {
      ...rest,
      type: 'text',
      value: Number(value),
    });
  };

  render() {
    const { name, min, max } = this.props;
    const value = this.context.getFilterValue(name);
    return (
      <Form.Input
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
                this.context.onFilterChange(evt, { name, value: '' });
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
  ...Form.Input.propTypes,
  name: PropTypes.string.isRequired,
};

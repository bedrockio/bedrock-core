import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '/semantic';

import SearchContext from '../Context';

export default class CheckboxFilter extends React.Component {
  static contextType = SearchContext;

  onChange = (evt, { checked, ...rest }) => {
    this.context.onFilterChange({
      ...rest,
      value: checked,
    });
  };

  render() {
    const { name, ...rest } = this.props;
    return (
      <Form.Checkbox
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
  ...Form.Input.propTypes,
  name: PropTypes.string.isRequired,
};

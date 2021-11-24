import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';

import SearchContext from '../Context';

export default class SearchFilter extends React.Component {
  static contextType = SearchContext;

  render() {
    const { loading } = this.context;
    const { name, ...rest } = this.props;
    return (
      <Form.Input
        name={name}
        loading={loading}
        icon={this.renderIcon()}
        value={this.context.getFilterValue(name) || ''}
        onChange={this.context.onFilterChange}
        {...rest}
      />
    );
  }

  renderIcon() {
    const { name } = this.props;
    const value = this.context.getFilterValue(name);
    return {
      name: value ? 'close' : 'search',
      link: true,
      onClick: (evt) => {
        if (value) {
          this.context.onFilterChange(evt, { name, value: '' });
        }
        evt.target.closest('.input').querySelector('input').focus();
      },
    };
  }
}

SearchFilter.propTypes = {
  ...Form.Input.propTypes,
  name: PropTypes.string.isRequired,
};

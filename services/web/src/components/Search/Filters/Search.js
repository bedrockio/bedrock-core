import React from 'react';
import PropTypes from 'prop-types';
import SearchContext from '../Context';
import { TextInput } from '@mantine/core';

export default class SearchFilter extends React.Component {
  static contextType = SearchContext;

  getValue() {
    const { name } = this.props;
    const { filters } = this.context;
    return filters[name] || '';
  }

  render() {
    const { loading, onFilterChange } = this.context;

    return (
      <TextInput
        {...this.props}
        fluid
        loading={loading}
        disabled={loading}
        type="search"
        style={{ minWidth: '220px' }}
        placeholder="Search by keyword"
        icon={this.renderIcon()}
        value={this.getValue()}
        onChange={(evt, data) => {
          onFilterChange(data);
        }}
      />
    );
  }

  renderIcon() {
    const { name } = this.props;
    const value = this.getValue();
    return {
      name: value ? 'close' : 'magnifying-glass',
      link: true,
      onClick: (evt) => {
        if (value) {
          this.context.onFilterChange({ name, value: '' });
        }
        evt.target.closest('.input').querySelector('input').focus();
      },
    };
  }
}

SearchFilter.propTypes = {
  name: PropTypes.string.isRequired,
};

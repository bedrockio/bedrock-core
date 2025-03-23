import React from 'react';

import SearchContext from '../Context';
import { TextInput } from '@mantine/core';

export default class KeywordFilter extends React.Component {
  static contextType = SearchContext;

  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
    };
  }

  componentDidMount() {
    const { filters } = this.context;
    this.setState({
      keyword: filters['keyword'] || '',
    });
  }

  onChange = (e) => {
    const { value } = e.currentTarget;
    this.setState({
      keyword: value,
    });
  };

  onKeyDown = (evt) => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      const { keyword } = this.state;
      this.context.onFilterChange({
        name: 'keyword',
        value: keyword,
      });
    }
  };

  render() {
    const { keyword } = this.state;
    const { loading } = this.context;

    return (
      <TextInput
        {...this.props}
        loading={loading}
        disabled={loading}
        type="search"
        style={{ minWidth: '220px' }}
        placeholder="Search by keyword"
        icon={this.renderIcon()}
        value={keyword}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
      />
    );
  }

  renderIcon() {
    const { keyword } = this.state;
    return {
      name: keyword ? 'close' : 'magnifying-glass',
      link: true,
      onClick: (evt) => {
        if (keyword) {
          this.setState({
            keyword: '',
          });
          this.context.onFilterChange({
            name: 'keyword',
            value: '',
          });
        }
        evt.target.closest('.input').querySelector('input').focus();
      },
    };
  }
}

KeywordFilter.propTypes = {
  ...TextInput.propTypes,
};

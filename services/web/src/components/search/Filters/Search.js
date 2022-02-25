import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';

import SearchContext from '../Context';

export default class SearchFilter extends React.Component {
  static contextType = SearchContext;

  state = {
    value: this.context.getFilterValue(this.props.name),
  };

  render() {
    const { loading, onFilterChange } = this.context;
    const { name, ...rest } = this.props;
    const { value } = this.state;

    return (
      <Form.Input
        name={name}
        loading={loading}
        icon={this.renderIcon()}
        value={this.state.value}
        onChange={(e, { value }) => this.setState({ value })}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            onFilterChange({}, { value, name });
          }
        }}
        {...rest}
      />
    );
  }

  renderIcon() {
    const { name } = this.props;
    const value = this.state.value;
    return {
      name: value ? 'close' : 'search',
      link: true,
      onClick: (evt) => {
        if (value) {
          this.setState({
            value: '',
          });
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

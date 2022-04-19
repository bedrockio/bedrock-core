import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';
import { withSearchProvider } from '../Context';

@withSearchProvider
export default class SearchFilter extends React.Component {
  state = {
    value: this.props.context.filters[this.props.name],
  };

  componentDidUpdate(lastProps) {
    if (
      lastProps.context.filters[this.props.name] !==
      this.props.context.filters[this.props.name]
    ) {
      this.setState({
        value: this.props.context.filters[this.props.name],
      });
    }
  }

  render() {
    const { loading, onFilterChange } = this.props.context;
    const { name, ...rest } = this.props;
    const { value } = this.state;

    return (
      <Form.Input
        loading={loading}
        type="search"
        placeholder="Search by keyword"
        icon={this.renderIcon()}
        value={this.state.value || ''}
        onChange={(e, { value }) => this.setState({ value })}
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            this.setState({ value: value }, () => {
              onFilterChange({ value, name });
            });
          }
        }}
        {...rest}
      />
    );
  }

  renderIcon() {
    const { name, context } = this.props;
    const value = this.state.value;
    return {
      name: value ? 'close' : 'search',
      link: true,
      onClick: (evt) => {
        if (value) {
          this.setState({
            value: '',
          });
          context.onFilterChange({ name, value: '' });
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

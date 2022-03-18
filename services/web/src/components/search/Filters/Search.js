import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic';
import SearchContext from '../Context';

export default class SearchFilter extends React.Component {
  static contextType = SearchContext;

  state = {
    value: this.context.filters[this.props.name] || '',
  };

  getSnapshotBeforeUpdate() {
    return this.context;
  }

  componentDidUpdate(lastProps, lastState, lastContext) {
    if (
      lastContext.filters[this.props.name] !=
      this.context.filters[this.props.name]
    ) {
      this.setState({
        value: this.props.context.filters[this.props.name],
      });
    }
  }

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
          this.context.onFilterChange({ name, value: '' });
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

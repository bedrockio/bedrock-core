import React from 'react';
import { Icon } from 'semantic';

export default class Overview extends React.Component {
  state = {};

  componentDidMount() {
    this.getDisplayValue();
  }

  async getDisplayValue() {
    const { getDisplayValue, type } = this.props.mapping;

    if (getDisplayValue) {
      this.setState({ loading: true });
      try {
        const value = await getDisplayValue(this.props.value);
        this.setState({
          value,
          loading: false,
        });
      } catch (e) {
        this.setState({
          error: e,
          loading: false,
        });
      }
    } else if (type === 'boolean') {
      this.setState({ value: this.props.value ? 'Checked' : 'Unchecked' });
    } else if (type === 'date') {
      const { value } = this.props;
      if (value.gte && value.lte) {
        this.setState({
          value: `${value.gte.toLocaleDateString(undefined, {
            dateStyle: 'short',
          })} - ${value.lte.toLocaleDateString(undefined, {})}`,
        });
      } else if (value) {
        this.setState({ value });
      }
    } else {
      const { value } = this.props;
      this.setState({ value: Array.isArray(value) ? value.join(', ') : value });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <span title={this.state.error}>
          <Icon name="exclamation-circle" />
        </span>
      );
    }

    if (this.state.loading) {
      return '-';
    }

    return this.state.value || '?';
  }
}

import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'semantic-ui-react';
import { omit, uniqBy, debounce } from 'lodash';

export default class SearchDropdown extends React.Component {
  state = {
    items: [],
    loading: false,
    error: null,
  };

  componentDidMount() {
    this.loadData();
  }

  async loadData(filters = {}) {
    try {
      this.setState({
        loading: false,
        error: null,
      });
      const { data } = await this.props.fetchData(filters);
      this.setState({
        items: data,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  onSearchChange = debounce(
    async (evt, { searchQuery }) => {
      this.loadData({ keyword: searchQuery });
    },
    200,
    { leading: true }
  );

  onChange = (evt, { value, ...rest }) => {
    const ids = Array.isArray(value) ? value : [value];
    const items = this.getAllItems();
    const selected = ids.map((id) => {
      return items.find((item) => item.id === id);
    });
    value = this.props.multiple ? selected : selected[0];
    this.props.onChange(evt, { value, ...rest });

    // Workaround for onSearchChange not updating when
    // the field is cleared internally.
    this.onSearchChange(evt, { searchQuery: '' });
  };

  getAllItems() {
    return uniqBy([...this.state.items, ...this.getSelectedItems()], 'id');
  }

  getSelectedItems() {
    const { value } = this.props;
    if (Array.isArray(value)) {
      return value;
    } else if (value) {
      return [value];
    } else {
      return [];
    }
  }

  getOptions() {
    return this.getAllItems().map(({ name, id }) => {
      return {
        text: name,
        value: id,
      };
    });
  }

  getValue() {
    const { multiple, value } = this.props;
    if (multiple) {
      return value.map((obj) => obj.id);
    } else {
      return value?.id || '';
    }
  }

  render() {
    const { loading, error } = this.state;

    return (
      <Dropdown
        {...omit(this.props, Object.keys(SearchDropdown.propTypes))}
        error={!!error}
        loading={loading}
        value={this.getValue()}
        options={this.getOptions()}
        onChange={this.onChange}
        onSearchChange={this.onSearchChange}
        search
        selection
        clearable
      />
    );
  }
}

SearchDropdown.propTypes = {
  fetchData: PropTypes.func.isRequired,
};

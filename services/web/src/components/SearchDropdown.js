import { Loader, MultiSelect, Select } from '@mantine/core';
import { debounce, isEmpty, omit, uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { request } from 'utils/api';

function isValueObject(props) {
  if (props.value && !isEmpty(props.value)) {
    return Array.isArray(props.value)
      ? typeof props.value[0] === 'object'
      : typeof props.value === 'object';
  } else {
    return props.objectMode;
  }
}

export default class SearchDropdown extends React.Component {
  state = {
    items: [],
    selectedItems: [],
    loading: false,
    error: null,
    objectMode: isValueObject(this.props),
  };

  componentDidMount() {
    if (this.props.value) {
      this.fetchSelectedItems();
    }
  }

  fetch = async (body) => {
    if (this.props.onDataNeeded) {
      return this.props.onDataNeeded(body);
    }

    return await request({
      method: 'POST',
      path: this.props.searchPath,
      body: {
        ...body,
        ...this.props.searchBody,
      },
    });
  };

  async fetchSelectedItems() {
    const { value } = this.props;
    if (Array.isArray(value) && !value.length) {
      return;
    }
    try {
      const selected = await this.fetch({
        ids: (Array.isArray(value) ? value : [value]).map((item) =>
          this.props.getOptionValue(item),
        ),
      });

      this.setState({
        loading: false,
        selectedItems: selected.data || selected,
      });
    } catch (e) {
      this.setState({
        error: e,
        loading: false,
      });
    }
  }

  async fetchItems(query) {
    this.setState({
      loading: true,
      error: null,
    });
    try {
      const items = await this.fetch(query);
      this.setState({
        items: items.data || items,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  onSearchChange = debounce((searchQuery) => {
    const options = {};
    if (searchQuery) {
      options[this.props.keywordField] = searchQuery;
    }
    this.fetchItems(options);
  }, 200);

  onChange = (value) => {
    const ids = Array.isArray(value) ? value : [value];
    const items = this.getAllItems();
    const selected = ids.map((id) => {
      return items.find((item) => item.id === id);
    });

    if (!this.state.objectMode) {
      return this.props.onChange(value);
    }

    value = this.props.multiple ? selected : selected[0];
    this.props.onChange(value);
  };

  onFocus = () => {
    if (!this.state.items.length) {
      this.fetchItems();
    }
  };

  getAllItems() {
    return uniqBy([...this.state.items, ...this.state.selectedItems], 'id');
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
    return this.getAllItems().map((item) => {
      const { getOptionLabel, getOptionValue } = this.props;
      const value = getOptionValue(item);
      return {
        id: value,
        key: value,
        label: getOptionLabel(item),
        value: value,
      };
    });
  }

  getValue() {
    const { multiple, value } = this.props;
    if (multiple) {
      return (value?.length ? value : []).map((obj) => obj.id || obj);
    } else {
      return value?.id || value || '';
    }
  }

  render() {
    const { loading, error } = this.state;
    const { multiple } = this.props;

    const Component = multiple ? MultiSelect : Select;

    return (
      <Component
        searchable
        {...omit(this.props, [
          ...Object.keys(propTypeShape),
          'onDataNeeded',
          'searchPath',
          'searchBody',
          'keywordField',
        ])}
        onClear={() => this.onChange(multiple ? [] : null)}
        error={!!error}
        rightSection={loading ? <Loader size={16} /> : null}
        value={this.getValue()}
        data={this.getOptions()}
        onChange={this.onChange}
        onSearchChange={this.onSearchChange}
        onFocus={this.onFocus}
      />
    );
  }
}

const propTypeShape = {
  objectMode: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
};

SearchDropdown.propTypes = PropTypes.oneOfType([
  PropTypes.shape({
    ...Select.propTypes,
    ...propTypeShape,
    onDataNeeded: PropTypes.func.isRequired,
  }),
  PropTypes.shape({
    ...Select.propTypes,
    ...propTypeShape,
    searchPath: PropTypes.string.isRequired,
    searchBody: PropTypes.object,
  }),
]).isRequired;

SearchDropdown.defaultProps = {
  keywordField: 'keyword',
  objectMode: true,
  getOptionLabel: (item) => item?.name || item,
  getOptionValue: (item) => item?.id || item,
};

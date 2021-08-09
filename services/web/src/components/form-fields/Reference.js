import React from 'react';
import PropTypes from 'prop-types';
import { debounce, uniqBy, omit } from 'lodash';
import { Form } from 'semantic';
import { request } from 'utils/api';

export default class ReferenceField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: false,
    };
  }

  // Events

  onChange = (evt, { value, ...rest }) => {
    const { data } = this.state;
    if (this.isMultiple()) {
      value = data.filter((item) => value.includes(item.id));
    } else {
      value = data.find((item) => item.id === value);
    }
    this.props.onChange(evt, { value, ...rest });
  };

  onSearchChange = (evt, { searchQuery: query }) => {
    this.search(query);
  };

  search = debounce(async (query) => {
    if (query) {
      const { path } = this.props;
      this.setState({
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path,
        body: {
          keyword: query,
          limit: 20,
        },
      });
      this.setState({
        data,
        loading: false,
      });
    } else {
      this.setState({
        data: [],
        loading: false,
      });
    }
  }, 300);

  // Helpers

  isMultiple(value = this.props.value) {
    return Array.isArray(value);
  }

  getValue() {
    const { value } = this.props;
    if (this.isMultiple()) {
      return value.map((item) => item.id);
    } else {
      return value?.id;
    }
  }

  getItems() {
    const { value } = this.props;
    if (this.isMultiple()) {
      return value;
    } else {
      return value ? [value] : [];
    }
  }

  getOptions() {
    const items = uniqBy([...this.getItems(), ...this.state.data], 'id');
    return items.map((item) => {
      return {
        text: item.name,
        value: item.id,
      };
    });
  }

  render() {
    const { placeholder } = this.props;
    const { loading } = this.state;
    const props = omit(this.props, Object.keys(ReferenceField.propTypes));
    return (
      <Form.Dropdown
        search
        selection
        loading={loading}
        value={this.getValue()}
        options={this.getOptions()}
        multiple={this.isMultiple()}
        placeholder={placeholder}
        noResultsMessage={loading ? 'Loading...' : 'No results.'}
        renderLabel={this.renderLabel}
        onSearchChange={this.onSearchChange}
        onChange={this.onChange}
        {...props}
      />
    );
  }

  renderLabel = (label) => {
    const { icon, color } = this.props;
    return {
      color,
      content: label.text,
      icon,
    };
  };
}

ReferenceField.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
  path: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
};

ReferenceField.defaultProps = {
  placeholder: 'Search',
};

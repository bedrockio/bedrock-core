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
      const { resource, route } = this.props;
      this.setState({
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: `/1/${resource}${route}`,
        body: {
          ...this.getFilter(query),
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

  getFilter(query) {
    const { keyword, regex, field } = this.props;
    if (keyword) {
      return { keyword: query };
    } else {
      if (regex) {
        query = `/${query}/i`;
      }
      return { [field]: query };
    }
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
    const { resource } = this.props;
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
        placeholder={`Search ${resource}`}
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
  route: PropTypes.string,
  keyword: PropTypes.bool,
  regex: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  resource: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
};

ReferenceField.defaultProps = {
  route: '/search',
  keyword: false,
  regex: false,
  field: 'name',
};

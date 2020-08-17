import React from 'react';
import PropTypes from 'prop-types';
import { debounce, uniqBy } from 'lodash';
import { Form } from 'semantic-ui-react';
import { request } from 'utils/api';

export default class ReferenceField extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      query: '',
      ids: [],
      options: [],
      loading: false,
    };
    this.queued = 0;
  }

  // Lifecycle

  componentDidMount() {
    const { value } = this.props;
    if (value) {
      // Set the parent ids on mount so that it can submit later.
      // Do this on a timeout so that state conflicts don't occur.
      setTimeout(() => {
        const items = this.isMultiple(value) ? value : [value];
        this.setState({
          ids: this.mapIds(items),
          options: this.mapOptions(items),
        });
      });
    }
  }

  componentDidUpdate(lastProps, lastState) {
    const { ids } = this.state;
    if (ids !== lastState.ids) {
      this.props.onChange({
        name: this.props.name,
        value: this.isMultiple() ? ids : ids[0],
      });
    }
  }

  componentWillUnmount() {
    // Workaround for component re-mounting with an array of
    // only ids... If we get unmounted here then reset to the
    // original upload objects. Do this on a timeout so state
    // conflicts don't occur.
    const { ids, options } = this.state;
    if (ids.length) {
      setTimeout(() => {
        const items = ids.map((id) => {
          return options.find((opt) => opt.value === id).item;
        });
        this.props.onChange({
          name: this.props.name,
          value: this.isMultiple() ? items : items[0],
        });
      });
    }
  }

  // Events

  onChange = (evt, { value: ids }) => {
    if (!this.isMultiple()) {
      ids = ids.slice(-1);
    }
    this.setState({
      ids,
    });
  }

  onSearchChange = (evt, { searchQuery: query }) => {
    this.setState({
      query,
      loading: true,
    });
    this.search(query);
  }

  search = debounce(async (query) => {
    if (query) {
      const { resource } = this.props;
      this.queued += 1;
      this.setState({
        loading: true,
      });
      const { data } = await request({
        method: 'POST',
        path: `/1/${resource}/search`,
        body: {
          name: query,
          limit: 20,
        },
      });
      this.queued -= 1;
      if (this.queued === 0) {
        const options = uniqBy([
          ...this.state.options,
          ...this.mapOptions(data),
        ], 'value');
        this.setState({
          options,
          loading: false,
        });
      }
    } else if (!this.queued) {
      this.setState({
        loading: false,
      });
    }
  }, 300);

  // Helpers

  isMultiple(value = this.props.value) {
    return Array.isArray(value);
  }

  mapIds(items) {
    return items.map((item) => item.id);
  }

  mapOptions(items) {
    return items.map((item) => {
      return {
        item,
        text: item.name,
        value: item.id,
      };
    });
  }

  render() {
    const { icon, color, value, resource, onChange, ...rest } = this.props;
    const { ids, options, loading } = this.state;
    return (
      <Form.Dropdown
        search
        multiple
        selection
        value={ids}
        loading={loading}
        options={options}
        placeholder={`Search ${resource}`}
        noResultsMessage={loading ? 'Loading...' : 'No results.'}
        renderLabel={this.renderLabel}
        onSearchChange={this.onSearchChange}
        onChange={this.onChange}
        {...rest}
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
  }

}

ReferenceField.propTypes = {
  icon: PropTypes.string,
  color: PropTypes.string,
};

ReferenceField.defaultProps = {
  icon: 'check',
  color: 'green',
};

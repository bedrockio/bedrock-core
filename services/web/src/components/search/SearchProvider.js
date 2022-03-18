import React from 'react';
import PropTypes from 'prop-types';
import { pickBy, uniqueId } from 'lodash';

import SearchContext from './Context';
import Pagination from './Pagination';
import { withRouter } from 'react-router';

const deplayedFieldsFields = {};

@withRouter
export default class SearchProvider extends React.Component {
  static Pagination = Pagination;

  constructor(props) {
    super(props);
    this.state = {
      id: uniqueId('search'),
      loading: true,
      items: [],
      error: null,
      fields: props.fields || {},
      filters: props.filters,
      limit: props.limit,
      page: props.page,
      sort: props.sort,
    };
  }

  componentDidMount() {
    this.fetch();

    this.setState({
      fields: deplayedFieldsFields[this.state.id],
    });

    setTimeout(() => {
      this.updateFilterFromSearchParams();
    }, 0);
  }

  componentDidUpdate(lastProps, lastState) {
    const changedProps = this.getChanged(this.props, lastProps);
    if (changedProps) {
      this.setState({
        ...changedProps,
      });
    } else if (this.hasChanged(this.state, lastState)) {
      this.fetch();
    }
  }

  updateFilterFromSearchParams = () => {
    const params = new URLSearchParams(this.props.history.location.search);
    const filters = {};
    const fields = this.state.fields;

    for (let [key, value] of params) {
      if (fields[key]) {
        filters[key] = value;
      }
    }
    this.setFilters(filters);
  };

  hasChanged(current, last) {
    return !!this.getChanged(current, last);
  }

  getChanged(current, last) {
    let changed = null;
    for (let key of ['page', 'sort', 'limit', 'filters']) {
      if (last[key] !== current[key]) {
        changed = {
          ...changed,
          [key]: current[key],
        };
      }
    }
    return changed;
  }

  // Events

  onPageChange = (evt, data) => {
    const { activePage: page } = data;
    if (this.props.onPageChange) {
      this.props.onPageChange(evt, page);
    } else {
      this.setState({
        page,
      });
    }
  };

  // Actions

  fetch = async () => {
    this.setState({
      error: null,
      loading: true,
    });
    try {
      const { page, limit, sort, filters } = this.state;
      const { data, meta } = await this.props.onDataNeeded({
        limit,
        sort,
        skip: (page - 1) * limit,
        ...filters,
      });
      this.setState({
        loading: false,
        items: data,
        meta: Object.assign({}, this.state.meta, meta),
      });
    } catch (error) {
      this.setState({
        loading: false,
        error,
      });
    }
  };

  reload = () => {
    // Performed on a setTimeout
    // to allow state to flush.
    setTimeout(this.fetch);
  };

  updateItems = (items) => {
    this.setState({
      items,
    });
  };

  replaceItem = (item, fn) => {
    let { items } = this.state;
    const index = items.findIndex((i) => {
      return fn ? fn(i) : i === item;
    });
    if (index !== -1) {
      items = [...items.slice(0, index), item, ...items.slice(index + 1)];
      this.setState({
        items,
      });
    }
  };

  getSorted = (field) => {
    const { sort } = this.state;
    if (field === sort.field) {
      return sort.order === 'asc' ? 'ascending' : 'descending';
    }
  };

  setSort = (field) => {
    const { sort } = this.state;
    let order;
    if (field === sort.field && sort.order === 'asc') {
      order = 'desc';
    } else {
      order = 'asc';
    }
    this.setState({
      sort: {
        field,
        order,
      },
    });
  };

  registerField = ({ name, ...props }) => {
    const fields = deplayedFieldsFields[this.state.id] || {};
    deplayedFieldsFields[this.state.id] = {
      ...fields,
      [name]: props,
    };

    return {
      name,
      label: props.label,
    };
  };

  setFilters = (filters) => {
    filters = pickBy(filters, (val) => {
      return Array.isArray(val) ? val.length : val;
    });

    this.setState({
      filters,
    });

    const queryObject = {};
    for (const key of Object.keys(filters)) {
      queryObject[key] = filters[key]?.id || filters[key];
    }

    this.props.history.push({
      pathname: this.props.history.location.pathname,
      search: '?' + new URLSearchParams(queryObject).toString(),
    });
  };

  onFilterChange = ({ name, value }) => {
    const filters = pickBy(
      {
        ...this.state.filters,
        [name]: value,
      },
      (val) => {
        return Array.isArray(val) ? val.length : val;
      }
    );
    this.setFilters(filters);
  };

  render() {
    const context = {
      ...this.state,
      reload: this.reload,
      update: this.update,
      setSort: this.setSort,
      getSorted: this.getSorted,
      setFilters: this.setFilters,
      replaceItem: this.replaceItem,
      updateItems: this.updateItems,
      onPageChange: this.onPageChange,
      onFilterChange: this.onFilterChange,
      registerField: this.registerField,
      onDataNeeded: this.props.onDataNeeded,
    };
    return (
      <SearchContext.Provider value={context}>
        {this.props.children(context)}
      </SearchContext.Provider>
    );
  }
}

SearchProvider.propTypes = {
  children: PropTypes.func.isRequired,
  onDataNeeded: PropTypes.func.isRequired,
  limit: PropTypes.number,
  page: PropTypes.number,
  sort: PropTypes.shape({
    order: PropTypes.string,
    field: PropTypes.string,
  }),
  onPageChange: PropTypes.func,
};

SearchProvider.defaultProps = {
  page: 1,
  limit: 20,
  sort: {
    order: 'desc',
    field: 'createdAt',
  },
  filters: {},
};

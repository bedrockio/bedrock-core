import React from 'react';
import PropTypes from 'prop-types';
import { pickBy } from 'lodash';

import SearchContext from './Context';
import Pagination from './Pagination';
import { withRouter } from 'react-router';

function convertFilters(filters) {
  return pickBy(filters, (val) => {
    return Array.isArray(val) ? val.length : val;
  });
}

function parseValue(type, value) {
  if (type === 'date') {
    return new Date(value);
  } else if (type === 'number') {
    return Number(value);
  } else if (type === 'boolean') {
    return Boolean(value);
  }
  return value;
}

function parseParamByType(param, value) {
  const type = param.type;
  if (param.multiple) {
    value = value.split('_');
    return value.map((value) => parseValue(type, value));
  }

  if (param.range) {
    value = value.split('/');
    return {
      gte: parseValue(type, value[0]),
      lte: parseValue(type, value[1]),
    };
  }

  return parseValue(type, value);
}

function convertValue(type, value) {
  if (type === 'date') {
    return new Date(value).toISOString();
  } else if (type === 'number') {
    return Number(value);
  } else if (type === 'boolean') {
    return Boolean(value);
  }
  return value?.id || value;
}

function getFiltersFromSearchParams(urlParams, filterMapping = {}) {
  const filters = {};
  for (let [key, value] of urlParams) {
    if (filterMapping[key]) {
      filters[key] = parseParamByType(filterMapping[key], value);
    }
  }
  return filters;
}

@withRouter
export default class SearchProvider extends React.Component {
  static Pagination = Pagination;

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      loading: true,
      items: [],
      error: null,
      filterMapping: props.filterMapping,
      filters: getFiltersFromSearchParams(
        new URLSearchParams(this.props.history.location.search),
        props.filterMapping
      ),

      limit: props.limit,
      page: props.page,
      sort: props.sort,
    };
  }

  componentDidMount() {
    this.fetch(true);
  }

  componentDidUpdate(lastProps, lastState) {
    const changedProps = this.getChanged(this.props, lastProps);
    if (changedProps) {
      this.setState({
        ...changedProps,
      });
    } else if (this.hasChanged(this.state, lastState) && this.state.ready) {
      this.fetch();
    }
  }

  updateUrlSearchParams(filters) {
    if (!this.state.filterMapping) {
      return;
    }
    const queryObject = {};
    for (const key of Object.keys(filters)) {
      const value = filters[key]?.id || filters[key];
      const mapping = this.state.filterMapping[key];
      if (!mapping) {
        console.warn('[SearchProvider] no mapping for filter', key);
        continue;
      }
      if (mapping.multiple) {
        queryObject[key] = value
          .map((value) => convertValue(mapping.type, value))
          .join('_');
      } else if (mapping.range) {
        queryObject[key] = [
          convertValue(mapping.type, value.gte),
          convertValue(mapping.type, value.lte),
        ].join('/');
      } else {
        queryObject[key] = convertValue(mapping.type, value);
      }
    }

    this.props.history.push({
      pathname: this.props.history.location.pathname,
      search: '?' + new URLSearchParams(queryObject).toString(),
    });
  }

  hasChanged(current, last) {
    return !!this.getChanged(current, last);
  }

  getChanged(current, last) {
    let changed = null;
    for (let key of ['page', 'sort', 'limit', 'filters', 'filterMapping']) {
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

  fetch = async (initial) => {
    if (!initial) {
      this.setState({
        error: null,
        loading: true,
      });
    }
    try {
      const { page, limit, sort, filters } = this.state;
      const { data, meta } = await this.props.onDataNeeded({
        limit,
        sort,
        skip: (page - 1) * limit,
        ...filters,
      });
      this.setState({
        ready: true,
        loading: false,
        items: data,
        meta: Object.assign({}, this.state.meta, meta),
      });
    } catch (error) {
      this.setState({
        ready: true,
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

  setFilters = (filters) => {
    const newFilters = convertFilters(filters);
    this.updateUrlSearchParams(newFilters);
    this.setState({
      filters: newFilters,
    });
  };

  onFilterChange = ({ name, value }) => {
    this.setFilters({
      ...this.state.filters,
      [name]: value,
    });
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

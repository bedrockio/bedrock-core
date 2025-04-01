import React from 'react';
import PropTypes from 'prop-types';
import { pickBy } from 'lodash';
import { withRouter } from '@bedrockio/router';

import SearchContext from './Context';

function convertFilters(filters) {
  return pickBy(filters, (val) => {
    return Array.isArray(val) ? val.length : val;
  });
}

function parseParamValue(type, value) {
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
    return value.map((value) => parseParamValue(type, value));
  }

  if (param.range) {
    value = value.split('/');
    return {
      gte: value[0] ? parseParamValue(type, value[0]) : undefined,
      lte: value[1] ? parseParamValue(type, value[1]) : undefined,
    };
  }

  return parseParamValue(type, value);
}

function convertParamValue(type, value) {
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

// withRouter and ref doesnt work well together, we need todo forward ref manually
const withRouterForwardRef = (Component) => {
  const WithRouter = withRouter(({ forwardedRef, ...props }) => (
    <Component ref={forwardedRef} {...props} />
  ));

  return React.forwardRef((props, ref) => (
    <WithRouter {...props} forwardedRef={ref} />
  ));
};

function getStateFromQueryString(search, filterMapping) {
  const urlParams = new URLSearchParams(search);
  const page = urlParams.get('page') ? Number(urlParams.get('page')) : 1;

  const filters = getFiltersFromSearchParams(urlParams, filterMapping);
  return {
    filters,
    page,
  };
}

class SearchProvider extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      items: [],
      error: null,
      ...getStateFromQueryString(props.location.search, props.filterMapping),
      filterMapping: props.filterMapping,
      limit: props.limit,
      sort: props.sort,
    };
  }

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(lastProps, lastState) {
    // checking if props has been changed
    const changedProps = this.getChanged(this.props, lastProps) || {};

    console.log('changedProps', changedProps);

    // check if the search query has been changed
    if (lastProps.location.search != this.props.location.search) {
      const { page, filters } = getStateFromQueryString(
        this.props.location.search,
        this.props.filterMapping,
      );
      changedProps.page = page;
      changedProps.filters = filters;
    }

    if (Object.keys(changedProps).length) {
      console.log('changedProps', 'hasChanged');
      this.setState({
        ...changedProps,
      });
      // checking if the state has been changed
    } else if (this.getChanged(this.state, lastState)) {
      console.log('changed');
      this.fetch();
    }
  }

  updateUrlSearchParams() {
    const { filters, filterMapping = {} } = this.state;
    const queryObject = {};

    // if there are no filters, dont update the url
    // this will prevent provider from losing state due to the url changing
    if (!Object.keys(filterMapping).length) {
      return;
    }

    if (this.state.page) {
      queryObject.page = this.state.page;
    }

    for (const key of Object.keys(filters)) {
      const value = filters[key]?.id || filters[key];
      const mapping = filterMapping[key];
      if (!mapping) {
        continue;
      }
      if (mapping.multiple) {
        queryObject[key] = value
          .map((value) => convertParamValue(mapping.type, value))
          .join('_');
      } else if (mapping.range) {
        queryObject[key] = [
          value.gte && convertParamValue(mapping.type, value.gte),
          value.lte && convertParamValue(mapping.type, value.lte),
        ]
          .filter(Boolean)
          .join('/');
      } else {
        queryObject[key] = convertParamValue(mapping.type, value);
      }
    }

    // only update the url if the search params have changed
    const params = new URLSearchParams(queryObject);

    if (!params.size) {
      return;
    }

    this.props.history.push('?' + params);
  }

  getChanged(current, last) {
    let changed = null;
    for (let key of ['page', 'sort', 'limit', 'filters', 'filterMapping']) {
      // JSON.stringify just to avoid rerender problems around the filterMapping
      if (JSON.stringify(last[key]) !== JSON.stringify(current[key])) {
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
      this.setState(
        {
          page,
        },
        () => this.updateUrlSearchParams(),
      );
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

  setFilters = (filters) => {
    const newFilters = convertFilters(filters);

    this.setState(
      {
        page: 1, // set page to 1 when filters change
        filters: newFilters,
      },
      () => this.updateUrlSearchParams(),
    );
  };

  onFilterChange = ({ name, value }) => {
    console.log('filter change', name, value);
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
        {typeof this.props.children === 'function'
          ? this.props.children(context)
          : this.props.children}
      </SearchContext.Provider>
    );
  }
}

SearchProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
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

export default withRouterForwardRef(SearchProvider);

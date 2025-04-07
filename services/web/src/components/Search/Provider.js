import { useState, useEffect, useRef } from 'react';
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

function getStateFromQueryString(search, filterMapping) {
  const urlParams = new URLSearchParams(search);
  const page = urlParams.get('page') ? Number(urlParams.get('page')) : 1;

  const filters = getFiltersFromSearchParams(urlParams, filterMapping);
  return {
    filters,
    page,
  };
}

/**
 * SearchProvider component to manage search state and context.
 * @param {Object} props - Component props.
 */
function SearchProvider({
  children,
  onDataNeeded,
  limit = 20,
  page = 1,
  sort = { order: 'desc', field: 'createdAt' },
  filters = {},
  filterMapping,
  onPageChange,
  history,
  location,
}) {
  const [state, setState] = useState({
    loading: true,
    items: [],
    error: null,
    page,
    filters,
    ...getStateFromQueryString(location.search, filterMapping),
    filterMapping,
    limit,
    sort,
  });

  const fetchRef = useRef();

  useEffect(() => {
    fetchRef.current = fetchData;
  });

  useEffect(() => {
    fetchRef.current();
  }, [state.filters, state.page, state.sort]);

  function fetchData() {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    onDataNeeded({
      limit: state.limit,
      sort: state.sort,
      skip: (state.page - 1) * state.limit,
      ...state.filters,
    })
      .then(({ data, meta }) => {
        setState((prevState) => ({
          ...prevState,
          loading: false,
          items: data,
          meta: { ...prevState.meta, ...meta },
        }));
      })
      .catch((error) => {
        setState((prevState) => ({ ...prevState, loading: false, error }));
      });
  }

  function updateUrlSearchParams() {
    const { filters, filterMapping = {} } = state;
    const queryObject = {};

    if (!Object.keys(filterMapping).length) {
      return;
    }

    if (state.page) {
      queryObject.page = state.page;
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

    const params = new URLSearchParams(queryObject);

    if (!params.size) {
      return;
    }

    history.push('?' + params);
  }

  function setFilters(newFilters) {
    const convertedFilters = convertFilters(newFilters);
    setState((prevState) => ({
      ...prevState,
      page: 1,
      filters: convertedFilters,
    }));
    updateUrlSearchParams();
  }

  function onFilterChange({ name, value }) {
    setFilters({
      ...state.filters,
      [name]: value,
    });
  }

  /**
   * Handles page change events.
   * @param {Object} evt - Event object.
   * @param {Object} data - Data containing the active page.
   */
  function onPageChangeFn(evt, data) {
    const { activePage: page } = data;
    if (typeof onPageChange === 'function') {
      onPageChange(evt, page);
    } else {
      setState((prevState) => ({
        ...prevState,
        page,
      }));
      updateUrlSearchParams();
    }
  }

  function setSort(field) {
    const { sort } = state;
    let order;
    if (field === sort.field && sort.order === 'asc') {
      order = 'desc';
    } else {
      order = 'asc';
    }
    setState((prevState) => ({
      ...prevState,
      sort: {
        field,
        order,
      },
    }));
  }

  function getSorted(field) {
    const { sort } = state;
    if (field === sort.field) {
      return sort.order === 'asc' ? 'ascending' : 'descending';
    }
  }

  const context = {
    ...state,
    reload: fetchData,
    setFilters,
    onFilterChange,
    onPageChange: onPageChangeFn, // Added onPageChange to the context
    onDataNeeded,
    getSorted,
    setSort,
  };

  return (
    <SearchContext.Provider value={context}>
      {typeof children === 'function' ? children(context) : children}
    </SearchContext.Provider>
  );
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
  filters: PropTypes.object,
  filterMapping: PropTypes.object,
  onPageChange: PropTypes.func,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default withRouter(SearchProvider);

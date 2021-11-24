import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Message, Divider } from 'semantic';
import { debounce, pickBy } from 'lodash';
import Pagination from 'components/Pagination';

export const SearchContext = React.createContext();

export default class SearchProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      items: [],
      error: null,
      meta: {
        total: 0,
      },
      filters: props.filters,
      limit: props.limit,
      page: props.page,
      sort: props.sort,
      pending: {},
    };
  }

  componentDidMount() {
    this.fetch();
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

  setFilters = (filters) => {
    filters = pickBy(filters, (val) => {
      return Array.isArray(val) ? val.length : val;
    });
    this.setState({
      filters,
    });
  };

  onFilterChange = (evt, data) => {
    const { type, name, value, deferred } = data;
    if (deferred || type !== 'text') {
      this.setFilters({
        ...this.state.filters,
        [name]: value,
      });
    } else {
      this.setState({
        pending: {
          ...this.state.pending,
          [name]: value,
        },
      });
      this.setFilterDeferred(evt, {
        ...data,
        deferred: true,
      });
    }
  };

  setFilterDeferred = debounce(this.onFilterChange, 300);

  getFilterValue = (name) => {
    const { pending, filters } = this.state;
    return pending[name] || filters[name];
  };

  // Utils

  render() {
    const { loader } = this.props;
    const { loading } = this.state;
    if (loader && loading) {
      return <Loader active>Loading</Loader>;
    }
    const context = {
      ...this.state,
      reload: this.reload,
      update: this.update,
      setSort: this.setSort,
      getSorted: this.getSorted,
      setFilters: this.setFilters,
      replaceItem: this.replaceItem,
      updateItems: this.updateItems,
      onFilterChange: this.onFilterChange,
      getFilterValue: this.getFilterValue,
    };
    return (
      <SearchContext.Provider value={context}>
        {this.renderError()}
        {this.props.children(context)}
        {this.renderPagination()}
      </SearchContext.Provider>
    );
  }

  renderError() {
    const { error } = this.state;
    if (error) {
      return <Message error content={error.message} />;
    }
  }

  renderPagination() {
    const { pagination } = this.props;
    const { page, meta } = this.state;
    if (pagination && meta.total > meta.limit) {
      return (
        <React.Fragment>
          <Divider hidden />
          <Pagination
            page={page}
            limit={meta.limit}
            total={meta.total}
            onPageChange={this.onPageChange}
          />
        </React.Fragment>
      );
    }
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
  loader: PropTypes.bool,
  pagination: PropTypes.bool,
  onPageChange: PropTypes.func,
};

SearchProvider.defaultProps = {
  page: 1,
  limit: 20,
  sort: {
    order: 'desc',
    field: 'createdAt',
  },
  loader: true,
  pagination: true,
  filters: {},
};

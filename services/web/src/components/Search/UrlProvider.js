import { useLocation, useNavigate, useQuery } from '@bedrockio/router';
import { camelCase, snakeCase } from 'lodash';

import Provider from './Provider';

/**
 * A search provider that syncs search state with URL query parameters.
 * Wraps the base Provider component and manages URL-based pagination,
 * sorting, and filtering. Filter keys are converted between camelCase
 * (internal) and snake_case (URL).
 *
 * @param {Object} props - Component props passed to the underlying Provider.
 * @param {Object} [props.sort] - Default sort configuration.
 * @param {string} [props.sort.field] - Default field to sort by.
 * @param {string} [props.sort.order] - Default sort order ('asc' or 'desc').
 * @returns {JSX.Element} Provider component with URL-synced search state.
 */
export default function UrlProvider(props) {
  const { sort: defaultSort } = props;

  const query = useQuery();
  const location = useLocation();

  const navigate = useNavigate();

  const {
    skip,
    'sort.field': sortField,
    'sort.order': sortOrder,
    ...rest
  } = query;

  const params = {
    filters: getUrlFilters(rest),
    skip: Number(query.skip) || 0,
    sort: {
      ...defaultSort,
      ...(sortField && {
        field: sortField,
      }),
      ...(sortOrder && {
        order: sortOrder,
      }),
    },
  };

  function onParamsChange(state) {
    const { sort, skip, limit, ...rest } = state;

    const params = new URLSearchParams();

    for (let [key, value] of Object.entries(rest)) {
      if (value != null && value !== '') {
        params.set(snakeCase(key), value);
      }
    }

    const { field, order } = sort || {};

    if (field && field !== defaultSort?.field) {
      params.set('sort.field', field);
    }

    if (order && order !== defaultSort?.order) {
      params.set('sort.order', order);
    }

    if (skip) {
      params.set('skip', skip);
    }

    if (params.toString() !== location.search) {
      navigate.replace(params.size ? `?${params}` : '');
    }
  }

  return <Provider {...props} {...params} onParamsChange={onParamsChange} />;
}

function getUrlFilters(obj) {
  const filters = {};

  for (let [key, value] of Object.entries(obj)) {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }

    filters[camelCase(key)] = value;
  }

  return filters;
}

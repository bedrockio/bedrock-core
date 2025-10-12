import { useLocation, useNavigate, useSearch } from '@bedrockio/router';
import { camelCase, mapKeys, snakeCase } from 'lodash';

import Provider from './Provider';

export default function UrlProvider(props) {
  const { sort: defaultSort } = props;

  const search = useSearch();
  const location = useLocation();

  const navigate = useNavigate();

  const {
    skip,
    'sort.field': sortField,
    'sort.order': sortOrder,
    ...rest
  } = search;

  const params = {
    filters: toCamelCase(rest),
    skip: Number(search.skip) || 0,
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

function toCamelCase(obj) {
  return mapKeys(obj, (_, key) => camelCase(key));
}

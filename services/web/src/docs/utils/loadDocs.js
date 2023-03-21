import { once, kebabCase } from 'lodash';

import { request } from 'utils/api';

// TODO: need this??
function expandDocs(docs) {
  const pagesByUrl = {};
  for (let [apiPath, pathItem] of Object.entries(docs.paths || {})) {
    for (let [method, item] of Object.entries(pathItem || {})) {
      item.path = ['paths', apiPath, method];

      method = method.toUpperCase();

      item.method = method;
      item.apiPath = apiPath;
      item.verbPath = `${method} ${apiPath}`;

      let slug = kebabCase(item.summary);
      slug ||= `${method}-${apiPath.split('/').join('-')}`;

      const pageUrl = `/docs/${apiPath.split('/')[2]}`;
      const itemUrl = `${pageUrl}#${slug}`;

      item.slug = slug;
      item.url = itemUrl;

      pagesByUrl[pageUrl] ||= {
        url: pageUrl,
        type: 'docs',
        title: item['x-group'] || '<GROUP>',
        items: [],
      };
      pagesByUrl[pageUrl].items.push(item);
    }
  }
  return {
    pagesByUrl,
    ...docs,
  };
}

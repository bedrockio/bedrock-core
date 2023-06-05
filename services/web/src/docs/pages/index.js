import { kebabCase } from 'lodash';

import * as GettingStarted from './GettingStarted.mdx';
import * as Authentication from './Authentication.mdx';
import * as Products from './Products.mdx';
import * as Shops from './Shops.mdx';
import * as Mfa from './Mfa.mdx';

const PAGES = {
  Authentication,
  GettingStarted,
  Shops,
  Products,
  Mfa,
};

export const DEFAULT_PAGE_ID = 'getting-started';

const root = {};
const pagesById = {};

for (let [key, mod] of Object.entries(PAGES)) {
  const { default: Component, group, hide, ...rest } = mod;
  const title = mod.title || key;
  const id = kebabCase(title);

  if (hide) {
    continue;
  }

  const page = {
    id,
    title,
    Component,
    ...rest,
  };

  pagesById[id] = page;

  if (group) {
    root[group] ||= {
      pages: {},
    };
    root[group].pages[title] = page;
  } else {
    root[title] ||= {
      pages: {},
    };
    Object.assign(root[title], page);
  }
}

function getSorted(obj = {}) {
  const pages = Object.values(obj);
  pages.sort((a, b) => {
    const { order: aOrder = 0, title: aTitle } = a;
    const { order: bOrder = 0, title: bTitle } = b;
    if (aOrder === bOrder) {
      return aTitle.localeCompare(bTitle);
    } else {
      return aOrder - bOrder;
    }
  });
  return pages.map((page) => {
    return {
      ...page,
      pages: getSorted(page.pages),
    };
  });
}

const sorted = getSorted(root);

export { sorted, pagesById };

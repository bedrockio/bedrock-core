import { kebabCase } from 'lodash';

import * as GettingStarted from './GettingStarted.mdx';
import * as Authentication from './Authentication.mdx';
import * as PasswordAuthentication from './PasswordAuthentication.mdx';
import * as PasskeyAuthentication from './PasskeyAuthentication.mdx';
import * as GoogleAuthentication from './GoogleAuthentication.mdx';
import * as AppleAuthentication from './AppleAuthentication.mdx';
import * as OtpAuthentication from './OtpAuthentication.mdx';
import * as TotpAuthentication from './TotpAuthentication.mdx';
import * as Products from './Products.mdx';
import * as Uploads from './Uploads.mdx';
import * as Shops from './Shops.mdx';
import * as Users from './Users.mdx';

const PAGES = {
  Authentication,
  PasswordAuthentication,
  PasskeyAuthentication,
  GoogleAuthentication,
  AppleAuthentication,
  TotpAuthentication,
  OtpAuthentication,
  GettingStarted,
  Products,
  Uploads,
  Shops,
  Users,
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
    const { order: aOrder, title: aTitle } = a;
    const { order: bOrder, title: bTitle } = b;
    if (aOrder == null && bOrder != null) {
      return 1;
    } else if (aOrder != null && bOrder == null) {
      return -1;
    } else if (aOrder === bOrder) {
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

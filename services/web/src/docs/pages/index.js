import { kebabCase } from 'lodash';

import * as Authentication from './Authentication.mdx';
import * as FederatedAuthentication from './FederatedAuthentication.mdx';
import * as GettingStarted from './GettingStarted.mdx';
import * as OtpAuthentication from './OtpAuthentication.mdx';
import * as PasskeyAuthentication from './PasskeyAuthentication.mdx';
import * as PasswordAuthentication from './PasswordAuthentication.mdx';
import * as Products from './Products.mdx';
import * as Shops from './Shops.mdx';
import * as Signup from './Signup.mdx';
import * as TotpAuthentication from './TotpAuthentication.mdx';
import * as Uploads from './Uploads.mdx';
import * as Users from './Users.mdx';

const PAGES = {
  Authentication,
  PasswordAuthentication,
  PasskeyAuthentication,
  FederatedAuthentication,
  TotpAuthentication,
  OtpAuthentication,
  GettingStarted,
  Products,
  Uploads,
  Signup,
  Shops,
  Users,
};

export const DEFAULT_PAGE_ID = 'getting-started';

const root = {};
const pagesByPath = {};

for (let [key, mod] of Object.entries(PAGES)) {
  const { default: Component, group, hide, ...rest } = mod;
  const title = mod.title || key;
  const id = kebabCase(title);
  const path = [kebabCase(group), id].filter(Boolean).join('/');

  if (hide) {
    continue;
  }

  const page = {
    id,
    title,
    path,
    Component,
    ...rest,
  };

  pagesByPath[path] = page;

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
    const { order: aOrder = 100, title: aTitle } = a;
    const { order: bOrder = 100, title: bTitle } = b;
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

export { pagesByPath, sorted };

import { NavLink, useLocation } from '@bedrockio/router';
import { NavLink as MantineNavLink } from '@mantine/core';

import { ExternalLink } from './Link';

export default function MenuItem(props) {
  const { url, label, icon: Icon, items = [], exact } = props;

  const isExternal = url?.startsWith('http');

  const { pathname } = useLocation();

  function getNestedProps() {
    if (items.length) {
      return {
        opened: isOpened(),
        children: items.map((item) => {
          return <MenuItem key={item.url} {...item} />;
        }),
      };
    }
  }

  function getNavProps() {
    if (url && isExternal) {
      return {
        component: ExternalLink,
        href: url,
      };
    } else if (url) {
      return {
        exact,
        component: NavLink,
        to: url,
      };
    }
  }

  function isOpened() {
    if (url) {
      return exact ? url === pathname : pathname.startsWith(url);
    }
  }

  return (
    <MantineNavLink
      label={label}
      leftSection={Icon && <Icon />}
      {...getNavProps()}
      {...getNestedProps()}
    />
  );
}

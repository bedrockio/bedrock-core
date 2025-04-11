import { NavLink as MantineNavLink } from '@mantine/core';

import { NavLink } from '@bedrockio/router';

export function LinksGroup({ icon: Icon, label, href, links }) {
  const hasLinks = Array.isArray(links);

  const items = (hasLinks ? links : []).map((link) => (
    <MantineNavLink
      leftSection={<link.icon size={16} />}
      component={NavLink}
      to={link.href}
      href={link.href}
      key={link.label}
      label={link.label}
      style={{ paddingLeft: `var(--mantine-spacing-lg)` }}
    />
  ));

  return (
    <>
      {hasLinks ? (
        <MantineNavLink
          childrenOffset={0}
          leftSection={<Icon size={16} stroke={1.5} />}
          label={label}
          href={href}
          to={href}>
          {items}
        </MantineNavLink>
      ) : (
        <MantineNavLink
          component={NavLink}
          leftSection={<Icon size={16} stroke={1.5} />}
          label={label}
          href={href}
          to={href}
        />
      )}
    </>
  );
}

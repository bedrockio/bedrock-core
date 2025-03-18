import { useState } from 'react';

import { NavLink as MantineNavLink } from '@mantine/core';

import { Link } from '@bedrockio/router';

export function LinksGroup({
  icon: Icon,
  label,
  href,
  initiallyOpened,
  links,
}) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  const items = (hasLinks ? links : []).map((link) => (
    <MantineNavLink
      leftSection={<Icon size={16} stroke={1.5} />}
      component={Link}
      to={link.href}
      href={link.href}
      key={link.label}
      label={link.label}
    />
  ));

  return (
    <>
      {hasLinks ? (
        <MantineNavLink
          leftSection={<Icon size={16} stroke={1.5} />}
          label={label}
          href={href}
          to={href}>
          {items}
        </MantineNavLink>
      ) : (
        <MantineNavLink
          component={Link}
          leftSection={<Icon size={16} stroke={1.5} />}
          label={label}
          href={href}
          to={href}
        />
      )}
    </>
  );
}

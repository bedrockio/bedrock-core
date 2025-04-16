import { NavLink as MantineNavLink } from '@mantine/core';
import { NavLink } from '@bedrockio/router';

export default function MenuItem({ icon: Icon, label, href, items }) {
  const hasLinks = Array.isArray(items);

  const _items = (hasLinks ? items : []).map((link) => (
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
          leftSection={Icon && <Icon size={16} stroke={1.5} />}
          label={label}
          href={href}
          to={href}>
          {_items}
        </MantineNavLink>
      ) : (
        <MantineNavLink
          component={NavLink}
          leftSection={Icon && <Icon size={16} stroke={1.5} />}
          label={label}
          href={href}
          to={href}
        />
      )}
    </>
  );
}

import { NavLink as MantineNavLink } from '@mantine/core';
import { NavLink } from '@bedrockio/router';

export default function MenuItem({
  external,
  icon: Icon,
  label,
  href,
  to,
  items,
}) {
  const hasLinks = Array.isArray(items) && items.length > 0;

  const _items = (hasLinks ? items : []).map((link) => (
    <MantineNavLink
      leftSection={link.icon && <link.icon size={16} />}
      component={(props) => {
        if (link.external) {
          return <a target="_blank" rel="noopener noreferrer" {...props} />;
        }
        return <NavLink {...props} />;
      }}
      to={link.href}
      href={link.href || to}
      key={link.href}
      label={link.label}
      style={{
        paddingLeft: Icon ? `34px` : `var(--mantine-spacing-lg)`,
      }}
    />
  ));

  return (
    <>
      {hasLinks ? (
        <MantineNavLink
          childrenOffset={0}
          leftSection={Icon && <Icon size={16} stroke={1.5} />}
          label={label}
          href={href || to}
          to={href}>
          {_items}
        </MantineNavLink>
      ) : (
        <MantineNavLink
          component={(props) => {
            if (external) {
              return <a target="_blank" rel="noopener noreferrer" {...props} />;
            }
            return <NavLink {...props} />;
          }}
          leftSection={Icon && <Icon size={16} stroke={1.5} />}
          label={label}
          href={href || to}
          to={href}
        />
      )}
    </>
  );
}

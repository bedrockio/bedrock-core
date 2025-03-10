import PropTypes from 'prop-types';
import { Link } from '@bedrockio/router';
import { Breadcrumbs as MantineBreadcrumbs, Group } from '@mantine/core';

export default function Breadcrumbs({
  active,
  link,
  separator = '/',
  path = [],
  children,
}) {
  const getPath = () => {
    return link ? [link] : path;
  };

  const items = [
    { title: 'Home', href: '/' },
    ...getPath().map((link) => ({ title: link })),
    ...(active ? [{ title: active }] : []),
  ];

  return (
    <div style={{ marginBottom: '5px' }}>
      <MantineBreadcrumbs separator={separator}>
        {items.map((item, index) =>
          item.href ? (
            <Link key={index} to={item.href}>
              {item.title}
            </Link>
          ) : (
            <span key={index}>{item.title}</span>
          ),
        )}
      </MantineBreadcrumbs>
      <Group>{children}</Group>
    </div>
  );
}

Breadcrumbs.propTypes = {
  active: PropTypes.node,
  link: PropTypes.node,
  path: PropTypes.arrayOf(PropTypes.node),
};

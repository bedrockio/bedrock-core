import React from 'react';
import { Link, NavLink } from '@bedrockio/router';
import { Menu } from 'semantic';

import { usePage } from 'stores/page';

import Layout from 'components/Layout';
import Breadcrumbs from 'components/Breadcrumbs';

import { Button } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

import Actions from '../Actions';

export default () => {
  const { shop, reload } = usePage();

  return (
    <React.Fragment>
      <Breadcrumbs link={<Link to="/shops">Shops</Link>} active={shop.name} />
      <Layout horizontal center spread>
        <h1>{shop.name}</h1>
        <Layout.Group>
          <Actions shop={shop} reload={reload} />
          <Button
            component={Link}
            to={`/shops/${shop.id}/edit`}
            rightSection={<IconPencil size={14} />}>
            Edit
          </Button>
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/shops/${shop.id}`}
          as={NavLink}
          exact
        />
        {/* --- Generator: menus */}
        <Menu.Item
          name="Products"
          to={`/shops/${shop.id}/products`}
          as={NavLink}
          exact
        />
        {/* --- Generator: end */}
      </Menu>
    </React.Fragment>
  );
};

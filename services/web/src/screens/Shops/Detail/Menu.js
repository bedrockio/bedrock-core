import React from 'react';
import { Link, NavLink } from '@bedrockio/router';
import { Menu, Button } from 'semantic';

import { usePage } from 'stores/page';

import EditShop from 'modals/EditShop';
import Layout from 'components/Layout';
import Breadcrumbs from 'components/Breadcrumbs';

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
          <EditShop
            shop={shop}
            onSave={reload}
            trigger={<Button primary icon="gear" content="Settings" />}
          />
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
